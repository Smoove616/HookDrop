# Subscription System Deployment Guide

## Edge Functions to Deploy

The subscription edge function files have been created in `supabase/functions/`:
1. `create-subscription/index.ts` - Creates Stripe subscription checkout sessions
2. `manage-billing-portal/index.ts` - Opens Stripe billing portal for subscription management
3. `stripe-webhook/index.ts` - Updated to handle subscription events

## Deployment Steps

### 1. Deploy Edge Functions

Since the Supabase project is currently inactive, deploy these functions when the project is active:

```bash
# Deploy create-subscription function
supabase functions deploy create-subscription

# Deploy manage-billing-portal function
supabase functions deploy manage-billing-portal

# Deploy updated stripe-webhook function
supabase functions deploy stripe-webhook
```

### 2. Set Up Stripe Products

In your Stripe Dashboard (https://dashboard.stripe.com):

1. **Create Pro Plan Product**:
   - Name: "Pro Plan"
   - Price: $9.99/month recurring
   - Copy the Price ID (starts with `price_`)
   
2. **Create Premium Plan Product**:
   - Name: "Premium Plan"
   - Price: $29.99/month recurring
   - Copy the Price ID (starts with `price_`)

### 3. Update Price IDs in Code

Update `src/components/SubscriptionPlans.tsx` with your actual Stripe Price IDs:

```typescript
const plans = [
  {
    name: 'Pro',
    priceId: 'price_YOUR_PRO_PRICE_ID', // Replace with actual Price ID
    // ...
  },
  {
    name: 'Premium',
    priceId: 'price_YOUR_PREMIUM_PRICE_ID', // Replace with actual Price ID
    // ...
  },
];
```

### 4. Configure Stripe Webhook

In Stripe Dashboard → Webhooks:

1. Add the following events to your existing webhook:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

2. Webhook endpoint URL remains:
   `https://cgsdkzoswqohkchznjsw.supabase.co/functions/v1/stripe-webhook`

### 5. Run Database Migrations

Execute the SQL from `DATABASE_SETUP.md` section "Subscription System Setup":

```sql
-- Add subscription columns to user_preferences table
ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_preferences_subscription_tier ON user_preferences(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_preferences_stripe_customer_id ON user_preferences(stripe_customer_id);
```

## Testing the Subscription Flow

### 1. Subscribe to a Plan
1. Log in to your account
2. Navigate to Profile → Subscription tab
3. Click "Subscribe" on Pro or Premium plan
4. Complete Stripe checkout
5. Verify redirect back to profile with success message

### 2. Verify Subscription Status
1. Check that your tier badge appears in navigation
2. Verify current plan shows correctly in Profile → Subscription tab
3. Check upload limits are enforced based on tier

### 3. Manage Subscription
1. Click "Manage Subscription" button (only visible for Pro/Premium users)
2. Verify Stripe billing portal opens
3. Test updating payment method
4. Test canceling subscription

### 4. Test Webhook Events
1. Subscribe to a plan
2. Check database: `user_preferences` should have updated `subscription_tier`
3. Cancel subscription in Stripe
4. Check database: tier should revert to 'free'

## Subscription Features

### Tier Benefits
- **Free**: 3 uploads/month, 10% platform fee
- **Pro**: 10 uploads/month, 7% platform fee, Pro badge
- **Premium**: Unlimited uploads, 5% platform fee, Premium badge

### Platform Fee Adjustment
The webhook automatically applies tier-based platform fees when processing purchases:
- Free users: 10% fee
- Pro users: 7% fee
- Premium users: 5% fee

## Troubleshooting

### Subscription not updating after payment
- Check Stripe webhook logs for errors
- Verify webhook events are configured correctly
- Check Supabase function logs: `supabase functions logs stripe-webhook`

### Billing portal not opening
- Verify customer has `stripe_customer_id` in database
- Check function logs: `supabase functions logs manage-billing-portal`
- Ensure user has an active subscription

### Upload limits not enforced
- Verify `subscription_tier` is set in `user_preferences` table
- Check upload logic reads from user's tier
- Implement upload limit check in upload function

## Next Steps

After deployment:
1. Test complete subscription flow end-to-end
2. Monitor webhook events in Stripe Dashboard
3. Set up email notifications for subscription events
4. Implement upload limit enforcement in upload modal
5. Add tier-based feature gating throughout the app
