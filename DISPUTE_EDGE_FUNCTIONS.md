# Dispute Resolution Edge Functions

## 1. create-dispute

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { type, subject, description, amount, priority, hookId, purchaseId } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) throw new Error('Unauthorized');

    const disputeNumber = `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data: dispute, error } = await supabase.from('disputes').insert({
      dispute_number: disputeNumber,
      type, subject, description, amount,
      priority: priority || 'medium',
      complainant_id: user.id,
      hook_id: hookId,
      purchase_id: purchaseId,
      status: 'open'
    }).select().single();

    if (error) throw error;

    await supabase.from('dispute_activity').insert({
      dispute_id: dispute.id,
      user_id: user.id,
      action: 'created',
      details: { type, subject }
    });

    return new Response(JSON.stringify({ dispute }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
```

## 2. send-dispute-message

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { disputeId, message, isInternal } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) throw new Error('Unauthorized');

    const { error } = await supabase.from('dispute_messages').insert({
      dispute_id: disputeId,
      sender_id: user.id,
      message,
      is_internal: isInternal || false
    });

    if (error) throw error;

    await supabase.from('dispute_activity').insert({
      dispute_id: disputeId,
      user_id: user.id,
      action: 'message_sent'
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
```

## 3. resolve-dispute

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
    const { disputeId, resolution, refundAmount, processRefund } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) throw new Error('Unauthorized');

    // Check admin role
    const { data: userData } = await supabase.from('auth.users').select('raw_user_meta_data').eq('id', user.id).single();
    if (userData?.raw_user_meta_data?.role !== 'admin') throw new Error('Unauthorized');

    let refundProcessed = false;
    if (processRefund && refundAmount) {
      const { data: dispute } = await supabase.from('disputes').select('purchase_id').eq('id', disputeId).single();
      if (dispute?.purchase_id) {
        const { data: purchase } = await supabase.from('purchases').select('payment_intent_id').eq('id', dispute.purchase_id).single();
        if (purchase?.payment_intent_id) {
          await stripe.refunds.create({
            payment_intent: purchase.payment_intent_id,
            amount: Math.round(refundAmount * 100)
          });
          refundProcessed = true;
        }
      }
    }

    const { error } = await supabase.from('disputes').update({
      status: 'resolved',
      resolution,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
      refund_amount: refundAmount,
      refund_processed: refundProcessed
    }).eq('id', disputeId);

    if (error) throw error;

    await supabase.from('dispute_activity').insert({
      dispute_id: disputeId,
      user_id: user.id,
      action: 'resolved',
      details: { resolution, refund_amount: refundAmount, refund_processed: refundProcessed }
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
```

Deploy these functions using:
```bash
supabase functions deploy create-dispute
supabase functions deploy send-dispute-message
supabase functions deploy resolve-dispute
```
