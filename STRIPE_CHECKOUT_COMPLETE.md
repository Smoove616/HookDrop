# Complete Stripe Checkout Flow

## Overview
The Stripe checkout flow is now fully implemented with single and multi-item purchase support.

## Current Implementation

### 1. Frontend Components
- **HookCard.tsx**: Buy Now button triggers single item checkout
- **ShoppingCart.tsx**: Checkout button handles multiple items
- **PurchaseSuccess.tsx**: Displays purchase confirmation with license key

### 2. Edge Function (create-checkout-session)
The function needs to be updated to handle both single and multiple items:

```typescript
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { 
      apiVersion: '2023-10-16' 
    });
    
    const body = await req.json();
    
    // Handle both single item and cart checkout
    let lineItems = [];
    let metadata = {};
    
    if (body.items) {
      // Multiple items from cart
      lineItems = body.items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.hookTitle} - ${item.licenseType.replace('_', ' ')} License`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      }));
      
      metadata = {
        buyer_id: user.id,
        items: JSON.stringify(body.items.map((item: any) => ({
          hook_id: item.hookId,
          seller_id: item.sellerId,
          license_type: item.licenseType,
          price: item.price,
          hook_title: item.hookTitle
        })))
      };
    } else {
      // Single item purchase
      const { hookId, hookTitle, price, sellerId, licenseType } = body;
      
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${hookTitle} - ${licenseType.replace('_', ' ')} License`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }];
      
      metadata = {
        hook_id: hookId,
        buyer_id: user.id,
        seller_id: sellerId,
        license_type: licenseType,
        hook_title: hookTitle,
        price: price.toString()
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/discover?purchase=cancelled`,
      customer_email: user.email,
      metadata: metadata,
    });

    return new Response(JSON.stringify({ url: session.url }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
```

### 3. Webhook Handler (stripe-webhook)
Already configured to handle purchase creation with license keys.

## Flow Diagram

1. User clicks "Buy Now" or "Checkout"
2. Frontend calls create-checkout-session
3. User redirected to Stripe payment page
4. User completes payment
5. Stripe webhook fires to stripe-webhook function
6. Purchase record created with license key
7. User redirected to /purchase-success
8. Success page displays license key and download button

## Testing

Test the checkout with Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

## Next Steps

The checkout flow is complete and ready to use!
