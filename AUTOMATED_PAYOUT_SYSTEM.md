# Automated Payout System

## Overview
This system automatically processes seller payouts on a scheduled basis (weekly/monthly) based on user preferences.

## Edge Function: process-automated-payouts

Deploy this function to run on a schedule (daily via cron):

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();

    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('user_id, payout_settings');

    const processedPayouts = [];
    const errors = [];

    for (const pref of preferences || []) {
      try {
        const settings = pref.payout_settings;
        if (!settings?.auto_payout_enabled) continue;

        let shouldProcess = false;
        if (settings.payout_schedule === 'weekly' && dayOfWeek === settings.payout_day) {
          shouldProcess = true;
        } else if (settings.payout_schedule === 'monthly' && dayOfMonth === settings.payout_day) {
          shouldProcess = true;
        }

        if (!shouldProcess) continue;

        const { data: earnings } = await supabase
          .from('earnings')
          .select('id, amount')
          .eq('seller_id', pref.user_id)
          .eq('status', 'available');

        const totalAvailable = earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;
        if (totalAvailable < (settings.minimum_threshold || 50)) continue;

        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_account_id, email, username')
          .eq('id', pref.user_id)
          .single();

        if (!profile?.stripe_account_id) continue;

        const transfer = await stripe.transfers.create({
          amount: Math.floor(totalAvailable * 100),
          currency: (settings.currency || 'USD').toLowerCase(),
          destination: profile.stripe_account_id,
          description: `Automated ${settings.payout_schedule} payout`,
        });

        const { data: payout } = await supabase
          .from('payouts')
          .insert({
            user_id: pref.user_id,
            amount: totalAvailable,
            status: 'completed',
            payment_method: 'stripe_connect',
            stripe_transfer_id: transfer.id,
            processed_at: new Date().toISOString(),
            payout_type: 'automated'
          })
          .select()
          .single();

        await supabase
          .from('earnings')
          .update({ 
            status: 'paid',
            payout_id: payout.id,
            paid_at: new Date().toISOString()
          })
          .eq('seller_id', pref.user_id)
          .eq('status', 'available');

        await supabase.functions.invoke('send-email', {
          body: {
            to: profile.email,
            subject: 'Payout Processed',
            html: `<h2>Payout of $${totalAvailable.toFixed(2)} processed!</h2>`
          }
        });

        processedPayouts.push({ user_id: pref.user_id, amount: totalAvailable });
      } catch (error) {
        errors.push({ user_id: pref.user_id, error: error.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed: processedPayouts.length,
      payouts: processedPayouts,
      errors
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
```

## Deployment

```bash
supabase functions deploy process-automated-payouts
```

## Setup Cron Job

Add to Supabase Dashboard > Database > Cron Jobs:

```sql
SELECT cron.schedule(
  'process-automated-payouts',
  '0 9 * * *', -- Daily at 9 AM UTC
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT.supabase.co/functions/v1/process-automated-payouts',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

## Database Updates

Add payout_type column:

```sql
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS payout_type TEXT DEFAULT 'manual';
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
```
