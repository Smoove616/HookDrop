# Stripe Payment System - Database Setup

## Required Database Tables

### 1. Earnings Table (if not exists)
```sql
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  purchase_id UUID REFERENCES purchases(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own earnings"
  ON earnings FOR SELECT
  USING (auth.uid() = seller_id);
```

### 2. Update Purchases Table
```sql
-- Add missing columns to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS license_key TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
```

## Stripe Webhook Configuration

The webhook endpoint is:
`https://cgsdkzoswqohkchznjsw.supabase.co/functions/v1/stripe-webhook`

Configure this in your Stripe Dashboard under Webhooks with the event:
- `checkout.session.completed`

## Features Implemented

1. ✅ Checkout session creation with Stripe
2. ✅ Webhook handler for payment confirmation
3. ✅ Automatic license key generation
4. ✅ Payment receipt generation and download
5. ✅ Payment history tracking
6. ✅ Earnings split (90% seller, 10% platform)
7. ✅ Payout request system


## Subscription System Setup

### 3. Update user_preferences Table for Subscriptions
```sql
-- Add subscription columns to existing user_preferences table
ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_preferences_subscription_tier ON user_preferences(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_preferences_stripe_customer_id ON user_preferences(stripe_customer_id);
```

### 4. Update Hooks Table for Upload Limits
```sql
-- Add seller_id index if not exists
CREATE INDEX IF NOT EXISTS idx_hooks_seller_id ON hooks(seller_id);
CREATE INDEX IF NOT EXISTS idx_hooks_created_at ON hooks(created_at);
```



## Subscription Tiers

| Feature | Free | Pro ($9.99/mo) | Premium ($29.99/mo) |
|---------|------|----------------|---------------------|
| Uploads per month | 3 | 10 | Unlimited |
| Platform fee | 10% | 7% | 5% |
| Priority support | ❌ | ✅ | ✅ |
| Analytics | Basic | Advanced | Advanced |
| Badge | - | Pro | Premium |

## Stripe Products Setup

Create these products in Stripe Dashboard:
1. **Pro Plan**: $9.99/month recurring
2. **Premium Plan**: $29.99/month recurring

## Webhook Events for Subscriptions

Add these events to your Stripe webhook:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
