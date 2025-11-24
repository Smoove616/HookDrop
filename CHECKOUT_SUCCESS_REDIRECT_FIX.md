# Checkout Success URL Redirect Fix

## Issue
The `create-checkout-session` edge function currently redirects to `/profile?purchase=success` after successful payment, but the `PurchaseSuccess` page expects a `session_id` parameter to load purchase details.

## Fix Required

### Update create-checkout-session Function

**Current Line 23:**
```javascript
success_url: `${req.headers.get('origin')}/profile?purchase=success`,
```

**Should be:**
```javascript
success_url: `${req.headers.get('origin')}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
```

## How to Apply Fix

### Option 1: Via Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/cgsdkzoswqohkchznjsw/functions
2. Click on `create-checkout-session` function
3. Edit the function code
4. Change line 23 to use the new success_url format
5. Deploy the updated function

### Option 2: Via Supabase CLI
```bash
# Navigate to your project
cd supabase/functions/create-checkout-session

# Edit index.ts and update line 23
# Then deploy:
supabase functions deploy create-checkout-session
```

## Complete Fixed Function Code

```typescript
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2023-10-16' });
    const { hookId, hookTitle, price, sellerId, licenseType } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ 
        price_data: { 
          currency: 'usd', 
          product_data: { name: `${hookTitle} - ${licenseType} License` }, 
          unit_amount: Math.round(price * 100) 
        }, 
        quantity: 1 
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/discover?purchase=cancelled`,
      metadata: { hook_id: hookId, user_id: sellerId, license_type: licenseType },
    });

    return new Response(JSON.stringify({ url: session.url }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
```

## Verification Steps

After applying the fix:

1. **Test the checkout flow:**
   - Browse to /discover
   - Add a hook to cart
   - Complete checkout with test card: 4242 4242 4242 4242
   - Verify redirect goes to `/purchase-success?session_id=cs_test_...`

2. **Verify purchase details load:**
   - Check that the PurchaseSuccess page displays:
     - Hook title
     - License type
     - License key
     - Amount paid
     - Purchase date
     - Download button

3. **Check database:**
   ```sql
   SELECT * FROM purchases 
   WHERE stripe_session_id = 'cs_test_...' 
   ORDER BY created_at DESC LIMIT 1;
   ```

## Why This Fix Works

- Stripe replaces `{CHECKOUT_SESSION_ID}` with the actual session ID
- PurchaseSuccess page queries: `eq('stripe_session_id', sessionId)`
- The webhook already stores `stripe_session_id` in purchases table
- This creates a complete flow: Checkout → Webhook → Database → Success Page
