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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const event = JSON.parse(body);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle one-time purchases
    if (event.type === 'checkout.session.completed' && event.data.object.mode === 'payment') {
      const session = event.data.object;
      const hookId = session.metadata.hook_id;
      const userId = session.metadata.user_id;
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
          user_id: userId,
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

      await supabase.from('earnings').insert({
        user_id: userId,
        purchase_id: purchase.id,
        amount: sellerEarnings,
        status: 'available'
      });

      await supabase.from('earnings').insert({
        user_id: PLATFORM_USER_ID,
        purchase_id: purchase.id,
        amount: platformFee,
        status: 'available'
      });


      if (licenseType === 'exclusive') {
        await supabase.from('hooks').update({ is_available: false }).eq('id', hookId);
      }
    }

    // Handle subscription creation
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const userId = subscription.metadata.user_id;
      
      // Determine tier from price
      let tier = 'free';
      if (subscription.items.data[0].price.unit_amount === 999) {
        tier = 'pro';
      } else if (subscription.items.data[0].price.unit_amount === 2999) {
        tier = 'premium';
      }

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          subscription_tier: tier,
          subscription_status: subscription.status,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      console.log(`Subscription ${subscription.status} for user ${userId}: ${tier}`);
    }

    // Handle subscription deletion/cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const userId = subscription.metadata.user_id;

      await supabase
        .from('user_preferences')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      console.log(`Subscription canceled for user ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});