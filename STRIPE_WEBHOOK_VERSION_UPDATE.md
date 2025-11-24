# Stripe Webhook Update for Version Control

## Updated stripe-webhook Edge Function

Replace the existing `stripe-webhook` edge function with this updated version that handles both regular hook purchases and version purchases.

### Deployment Instructions

1. Navigate to Supabase Dashboard → Edge Functions
2. Select the `stripe-webhook` function
3. Replace the entire code with the code below
4. Deploy the updated function

### Updated Edge Function Code

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature'
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const PLATFORM_USER_ID = '00000000-0000-0000-0000-000000000001';
const PLATFORM_FEE_PERCENTAGE = 0.10;

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;
  const parts = [];
  
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(segment);
  }
  
  return parts.join('-');
}

async function handleVersionPurchase(supabase: any, session: any) {
  const versionIds = session.metadata.version_ids ? JSON.parse(session.metadata.version_ids) : null;
  const bundleId = session.metadata.bundle_id;
  const sellerId = session.metadata.seller_id;
  const buyerId = session.metadata.buyer_id;
  const licenseType = session.metadata.license_type || 'non_exclusive';
  const amount = session.amount_total / 100;

  const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
  const sellerEarnings = amount * (1 - PLATFORM_FEE_PERCENTAGE);
  const licenseKey = generateLicenseKey();

  // Create version purchase records
  const purchaseRecords = [];
  
  if (bundleId) {
    const { data: bundle } = await supabase
      .from('version_bundles')
      .select('version_ids')
      .eq('id', bundleId)
      .single();
    
    if (bundle) {
      for (const versionId of bundle.version_ids) {
        purchaseRecords.push({
          version_id: versionId,
          buyer_id: buyerId,
          seller_id: sellerId,
          amount: amount / bundle.version_ids.length,
          license_type: licenseType,
          license_key: `${licenseKey}-V${versionId.slice(-4)}`,
          stripe_session_id: session.id,
          bundle_id: bundleId
        });
      }
    }
  } else if (versionIds) {
    for (const versionId of versionIds) {
      purchaseRecords.push({
        version_id: versionId,
        buyer_id: buyerId,
        seller_id: sellerId,
        amount: amount / versionIds.length,
        license_type: licenseType,
        license_key: `${licenseKey}-V${versionId.slice(-4)}`,
        stripe_session_id: session.id
      });
    }
  }

  const { data: purchases, error: purchaseError } = await supabase
    .from('version_purchases')
    .insert(purchaseRecords)
    .select();

  if (purchaseError) throw purchaseError;

  // Update download counts
  for (const record of purchaseRecords) {
    await supabase.rpc('increment', {
      table_name: 'hook_versions',
      row_id: record.version_id,
      column_name: 'download_count'
    });
  }

  // Create earnings
  await supabase.from('earnings').insert([
    { 
      seller_id: sellerId, 
      amount: sellerEarnings, 
      status: 'available', 
      metadata: { type: 'version_sale', session_id: session.id } 
    },
    { 
      seller_id: PLATFORM_USER_ID, 
      amount: platformFee, 
      status: 'available', 
      metadata: { type: 'platform_fee', session_id: session.id } 
    }
  ]);

  // Get hook and version details for email
  const { data: hook } = await supabase
    .from('hooks')
    .select('title, producer_id')
    .eq('id', session.metadata.hook_id)
    .single();

  const { data: producer } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', hook?.producer_id)
    .single();

  // Send email notification
  await supabase.functions.invoke('send-email', {
    body: {
      to: session.customer_details.email,
      subject: `Your ${hook?.title || 'Hook'} Versions are Ready!`,
      html: `
        <h2>Purchase Complete</h2>
        <p><strong>Hook:</strong> ${hook?.title || 'N/A'}</p>
        <p><strong>Producer:</strong> ${producer?.username || 'N/A'}</p>
        <p><strong>License Key:</strong> ${licenseKey}</p>
        <p><strong>Versions Purchased:</strong> ${purchaseRecords.length}</p>
        <p>Download your versions from your profile dashboard.</p>
        <p><a href="${Deno.env.get('SITE_URL')}/profile">Go to Profile</a></p>
      `
    }
  });

  console.log(`Version purchase: ${purchaseRecords.length} versions, Seller: $${sellerEarnings.toFixed(2)}, Platform: $${platformFee.toFixed(2)}`);
  
  return purchases;
}

async function handleHookPurchase(supabase: any, session: any) {
  const hookId = session.metadata.hook_id;
  const sellerId = session.metadata.seller_id;
  const buyerId = session.metadata.buyer_id;
  const licenseType = session.metadata.license_type || 'non_exclusive';
  const amount = session.amount_total / 100;
  const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
  const sellerEarnings = amount * (1 - PLATFORM_FEE_PERCENTAGE);
  const licenseKey = generateLicenseKey();

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      hook_id: hookId,
      seller_id: sellerId,
      buyer_id: buyerId,
      amount: amount,
      license_type: licenseType,
      license_key: licenseKey,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      status: 'completed'
    })
    .select()
    .single();

  if (purchaseError) throw purchaseError;

  await supabase.from('earnings').insert([
    { seller_id: sellerId, purchase_id: purchase.id, amount: sellerEarnings, status: 'available' },
    { seller_id: PLATFORM_USER_ID, purchase_id: purchase.id, amount: platformFee, status: 'available' }
  ]);

  if (licenseType === 'exclusive') {
    await supabase.from('hooks').update({ is_available: false }).eq('id', hookId);
  }

  console.log(`Hook purchase: Seller: $${sellerEarnings.toFixed(2)}, Platform: $${platformFee.toFixed(2)}`);
  
  return purchase;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Determine purchase type
      const isVersionPurchase = session.metadata.version_ids || session.metadata.bundle_id;

      if (isVersionPurchase) {
        await handleVersionPurchase(supabase, session);
        console.log('Version purchase completed:', session.id);
      } else {
        await handleHookPurchase(supabase, session);
        console.log('Hook purchase completed:', session.id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Log error to database for monitoring
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('webhook_logs').insert({
        event_type: 'error',
        error_message: error.message,
        stack_trace: error.stack,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
```

## Key Features Added

### 1. Version Purchase Detection
- Checks for `version_ids` or `bundle_id` in session metadata
- Routes to appropriate handler function

### 2. Version Purchase Handling
- Creates individual purchase records for each version
- Supports both individual version purchases and bundle purchases
- Generates unique license keys per version
- Updates download counts automatically

### 3. Email Notifications
- Sends purchase confirmation with license key
- Includes hook title, producer name, and version count
- Provides direct link to profile for downloads

### 4. Analytics Tracking
- Updates download counts for each version
- Logs transaction details for reporting
- Tracks bundle vs individual purchases

### 5. Error Handling
- Comprehensive try-catch blocks
- Error logging to database
- Graceful failure with proper HTTP responses

### 6. Earnings Distribution
- 90% to producer
- 10% platform fee
- Proper metadata tagging for version sales

## Testing Checklist

- [ ] Test individual version purchase
- [ ] Test bundle purchase
- [ ] Verify email notifications sent
- [ ] Check version_purchases table populated
- [ ] Confirm download counts updated
- [ ] Validate earnings records created
- [ ] Test error handling with invalid data
- [ ] Verify webhook logs for monitoring

## Environment Variables Required

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL` (for email links)

## Monitoring

Check webhook logs with:
```sql
SELECT * FROM webhook_logs 
WHERE event_type = 'error' 
ORDER BY timestamp DESC 
LIMIT 50;
```
