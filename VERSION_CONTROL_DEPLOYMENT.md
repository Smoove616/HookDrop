# Version Control System Deployment Guide

## Step 1: Create Database Tables

Run these SQL queries in Supabase SQL Editor:

### Create Tables
```sql
-- Create hook_versions table
CREATE TABLE IF NOT EXISTS hook_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_id UUID NOT NULL REFERENCES hooks(id) ON DELETE CASCADE,
  version_type TEXT NOT NULL,
  version_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  waveform_data JSONB,
  duration INTEGER NOT NULL,
  file_size INTEGER,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hook_id, version_type)
);

-- Create version_purchases table
CREATE TABLE IF NOT EXISTS version_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES hook_versions(id) ON DELETE CASCADE,
  price_paid DECIMAL(10, 2) NOT NULL,
  license_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create version_bundles table
CREATE TABLE IF NOT EXISTS version_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_id UUID NOT NULL REFERENCES hooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version_ids UUID[] NOT NULL,
  bundle_price DECIMAL(10, 2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Create Indexes
```sql
CREATE INDEX idx_hook_versions_hook_id ON hook_versions(hook_id);
CREATE INDEX idx_version_purchases_version_id ON version_purchases(version_id);
CREATE INDEX idx_version_bundles_hook_id ON version_bundles(hook_id);
```

### Enable RLS
```sql
ALTER TABLE hook_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_bundles ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies
```sql
CREATE POLICY "view_active_versions" ON hook_versions FOR SELECT USING (is_active = true);
CREATE POLICY "manage_own_versions" ON hook_versions FOR ALL USING (
  hook_id IN (SELECT id FROM hooks WHERE producer_id = auth.uid())
);

CREATE POLICY "view_own_purchases" ON version_purchases FOR SELECT USING (
  purchase_id IN (SELECT id FROM purchases WHERE buyer_id = auth.uid())
);

CREATE POLICY "view_active_bundles" ON version_bundles FOR SELECT USING (is_active = true);
CREATE POLICY "manage_own_bundles" ON version_bundles FOR ALL USING (
  hook_id IN (SELECT id FROM hooks WHERE producer_id = auth.uid())
);
```

## Step 2: Deploy Edge Function

Create edge function `create-version-checkout` with this code:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

import Stripe from 'https://esm.sh/stripe@14.21.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const { versionIds, bundleId, hookId, licenseType, successUrl, cancelUrl } = await req.json();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    let lineItems = [];
    let metadata: any = {
      hookId,
      licenseType,
      purchaseType: bundleId ? 'bundle' : 'versions'
    };

    if (bundleId) {
      const bundleResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/version_bundles?id=eq.${bundleId}&select=*`,
        {
          headers: {
            'Authorization': authHeader,
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          },
        }
      );
      const bundles = await bundleResponse.json();
      const bundle = bundles[0];

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: bundle.name,
            description: bundle.description || 'Version Bundle',
          },
          unit_amount: Math.round(bundle.bundle_price * 100),
        },
        quantity: 1,
      });

      metadata.bundleId = bundleId;
      metadata.versionIds = JSON.stringify(bundle.version_ids);
    } else {
      const versionResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/hook_versions?id=in.(${versionIds.join(',')})&select=*`,
        {
          headers: {
            'Authorization': authHeader,
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          },
        }
      );
      const versions = await versionResponse.json();

      lineItems = versions.map((version: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${version.title} - ${version.version_type}`,
            description: version.description || '',
          },
          unit_amount: Math.round(version.price * 100),
        },
        quantity: 1,
      }));

      metadata.versionIds = JSON.stringify(versionIds);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
```

## Step 3: Update Stripe Webhook

Add version purchase handling to the existing `stripe-webhook` function to process completed version purchases and create records in the database.

## Deployment Status

⚠️ **Note**: The Supabase project is currently inactive. Once reactivated:
1. Run all SQL queries in Supabase SQL Editor
2. Deploy the `create-version-checkout` edge function
3. Update the `stripe-webhook` function to handle version purchases
4. Test the complete flow

## Testing Checklist

- [ ] Tables created successfully
- [ ] RLS policies working correctly
- [ ] Edge function deployed
- [ ] Stripe checkout creates sessions
- [ ] Webhook processes version purchases
- [ ] Version purchases recorded in database
- [ ] Buyers can download purchased versions
