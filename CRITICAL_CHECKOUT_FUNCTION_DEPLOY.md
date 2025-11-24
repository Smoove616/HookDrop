# CRITICAL: Deploy create-checkout-session Function

## Issue
The `create-checkout-session` edge function is missing, causing JSON parse errors when users try to purchase hooks.

## Solution
Deploy this function to Supabase:

### Create File: `supabase/functions/create-checkout-session/index.ts`

```typescript
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' });
    const { hookId, hookTitle, price, sellerId, licenseType } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'usd', product_data: { name: `${hookTitle} - ${licenseType} License` }, unit_amount: Math.round(price * 100) }, quantity: 1 }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/profile?purchase=success`,
      cancel_url: `${req.headers.get('origin')}/discover?purchase=cancelled`,
      metadata: { hook_id: hookId, user_id: sellerId, license_type: licenseType },
    });

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
```

### Deploy Command
```bash
supabase functions deploy create-checkout-session --no-verify-jwt
```

### Set Environment Variable
In Supabase Dashboard → Edge Functions → Secrets:
- `STRIPE_SECRET_KEY`: Your Stripe secret key

## Platform Fee System
✅ Uses `user_id` in metadata (matches webhook)
✅ Webhook calculates 10% platform fee
✅ Earnings split: 90% seller, 10% platform
