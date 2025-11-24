# Stripe Connect Integration Setup

This guide explains how to set up Stripe Connect for seller payments and hook purchases.

## Prerequisites

1. Stripe account with Connect enabled
2. Supabase project with edge functions enabled
3. Environment variables configured

## Environment Variables

Add to your Supabase project settings:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
```

## Database Schema

Add Stripe Connect fields to user_preferences table:

```sql
ALTER TABLE user_preferences 
ADD COLUMN stripe_account_id TEXT,
ADD COLUMN stripe_onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN stripe_charges_enabled BOOLEAN DEFAULT false;
```

## Edge Functions

### 1. create-checkout-session

Create `supabase/functions/create-checkout-session/index.ts`:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

import Stripe from 'https://esm.sh/stripe@14.11.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { hookId, hookTitle, price, sellerId, licenseType } = await req.json();
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) throw new Error('Unauthorized');

    // Get seller's Stripe account
    const { data: sellerPrefs } = await supabase
      .from('user_preferences')
      .select('stripe_account_id, stripe_charges_enabled')
      .eq('user_id', sellerId)
      .single();

    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: hookTitle,
            description: `${licenseType} License`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/profile?purchase=success`,
      cancel_url: `${req.headers.get('origin')}/discover?purchase=cancelled`,
      metadata: {
        hook_id: hookId,
        seller_id: sellerId,
        buyer_id: user.id,
        license_type: licenseType,
      },
    };

    // Use Stripe Connect if seller has account
    if (sellerPrefs?.stripe_account_id && sellerPrefs?.stripe_charges_enabled) {
      const platformFee = Math.round(price * 100 * 0.10);
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerPrefs.stripe_account_id,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
```

### 2. create-connect-account

Create `supabase/functions/create-connect-account/index.ts`:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

import Stripe from 'https://esm.sh/stripe@14.11.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) throw new Error('Unauthorized');

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Save account ID
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        stripe_account_id: account.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get('origin')}/profile?connect=refresh`,
      return_url: `${req.headers.get('origin')}/profile?connect=success`,
      type: 'account_onboarding',
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
```

### 3. create-dashboard-link

Create `supabase/functions/create-dashboard-link/index.ts`:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

import Stripe from 'https://esm.sh/stripe@14.11.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) throw new Error('Unauthorized');

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (!prefs?.stripe_account_id) {
      throw new Error('No Stripe account found');
    }

    const loginLink = await stripe.accounts.createLoginLink(prefs.stripe_account_id);

    return new Response(JSON.stringify({ url: loginLink.url }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
```

## Deploy Functions

```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-connect-account
supabase functions deploy create-dashboard-link
```

## Testing

1. Enable Stripe Connect in your Stripe Dashboard
2. Use test mode credentials
3. Test seller onboarding flow
4. Test hook purchase with connected account
5. Verify webhook events are processed correctly
