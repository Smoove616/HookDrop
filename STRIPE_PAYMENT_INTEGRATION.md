# Stripe Payment Integration Guide

Complete guide for Stripe payment processing with Stripe Connect for seller payouts.

## Overview

This system implements:
- **Stripe Checkout** for hook purchases
- **Stripe Connect** for direct seller payments
- **License generation** upon successful payment
- **Webhook handling** for payment events
- **Seller dashboard** for earnings management

## Features

✅ One-time payments for hook purchases
✅ Exclusive and non-exclusive license options
✅ Automatic license key generation
✅ Stripe Connect for seller payouts (90% to seller, 10% platform fee)
✅ Payment confirmation and receipts
✅ Webhook event processing
✅ Seller earnings dashboard with Stripe dashboard access

## Setup Instructions

### 1. Stripe Account Setup

1. Create a Stripe account at https://stripe.com
2. Enable **Stripe Connect** in your dashboard
3. Get your API keys from the Developers section
4. Set up webhook endpoint in Stripe Dashboard

### 2. Environment Variables

Add to your Supabase project:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Database Schema Updates

```sql
-- Add Stripe Connect fields to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false;

-- Purchases table should have these fields
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hook_id UUID REFERENCES hooks(id),
  seller_id UUID REFERENCES auth.users(id),
  buyer_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  license_type TEXT NOT NULL,
  license_key TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Earnings table for tracking seller revenue
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id),
  purchase_id UUID REFERENCES purchases(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Edge Functions

### Function 1: create-checkout-session

**Purpose:** Creates Stripe Checkout session for hook purchases

**Endpoint:** `POST /functions/v1/create-checkout-session`

**Request Body:**
```json
{
  "hookId": "uuid",
  "hookTitle": "string",
  "price": 29.99,
  "sellerId": "uuid",
  "licenseType": "non_exclusive"
}
```

**Implementation:** See STRIPE_CONNECT_SETUP.md for full code

### Function 2: create-connect-account

**Purpose:** Creates Stripe Connect account for sellers

**Endpoint:** `POST /functions/v1/create-connect-account`

**Returns:** Onboarding URL for seller to complete Stripe Connect setup

### Function 3: create-dashboard-link

**Purpose:** Generates Stripe Express Dashboard login link

**Endpoint:** `POST /functions/v1/create-dashboard-link`

**Returns:** URL to Stripe Express Dashboard

### Function 4: stripe-webhook (Already exists)

**Purpose:** Handles Stripe webhook events

**Events Handled:**
- `checkout.session.completed` - Processes hook purchases
- `customer.subscription.created` - Handles subscriptions
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Cancels subscriptions

## Payment Flow

### Hook Purchase Flow

1. **User clicks "Buy Now"** on a hook
2. **License selection** (if both licenses available)
3. **Create checkout session** via edge function
4. **Redirect to Stripe Checkout**
5. **User completes payment**
6. **Stripe sends webhook** to your endpoint
7. **Webhook processes payment:**
   - Generates license key
   - Creates purchase record
   - Creates earnings records (seller + platform)
   - Marks exclusive hooks as unavailable
8. **User redirected** to success page
9. **Download available** in user profile

### Stripe Connect Flow

1. **Seller clicks "Connect Stripe"** in earnings tab
2. **Create Connect account** via edge function
3. **Redirect to Stripe onboarding**
4. **Seller completes onboarding**
5. **Return to profile** with connected status
6. **Future purchases** use Connect for direct payment

## Components

### StripeConnectOnboarding
- Displays connection status
- Initiates Stripe Connect onboarding
- Shows success state when connected

### SellerEarnings
- Displays total/available/pending earnings
- Shows recent sales
- Provides Stripe dashboard access button
- Real-time earnings tracking

### HookCard (Updated)
- "Buy Now" button triggers checkout
- License selection modal
- Calls create-checkout-session

### LicenseModal
- Displays license options
- Shows pricing for each license type
- Handles license selection

## Testing

### Test Mode

Use Stripe test mode credentials:
- Test card: 4242 4242 4242 4242
- Any future expiry date
- Any 3-digit CVC

### Test Scenarios

1. **Non-exclusive purchase**
   - Select non-exclusive license
   - Complete payment
   - Verify license key generated
   - Check earnings recorded

2. **Exclusive purchase**
   - Select exclusive license
   - Complete payment
   - Verify hook marked unavailable
   - Check higher earnings amount

3. **Stripe Connect**
   - Connect seller account
   - Make test purchase
   - Verify 90/10 split
   - Check Stripe dashboard access

## Webhook Configuration

### Stripe Dashboard Setup

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to Supabase environment variables

## Platform Fee Structure

- **Platform Fee:** 10% of each sale
- **Seller Earnings:** 90% of each sale
- **Stripe Fees:** Paid by platform (included in 10%)

Example: $29.99 hook sale
- Seller receives: $26.99
- Platform receives: $2.99
- Stripe fees: ~$1.00 (from platform fee)

## Security Considerations

- ✅ Webhook signature verification
- ✅ User authentication required
- ✅ Server-side price validation
- ✅ License key uniqueness
- ✅ Secure environment variables
- ✅ CORS headers configured

## Troubleshooting

### Common Issues

**Payment not processing:**
- Check webhook endpoint is accessible
- Verify webhook secret matches
- Check Supabase logs for errors

**Stripe Connect not working:**
- Ensure Connect is enabled in Stripe Dashboard
- Verify account has correct capabilities
- Check onboarding completion status

**License not generated:**
- Check webhook received event
- Verify database permissions
- Check Supabase function logs

## Next Steps

1. Deploy all edge functions
2. Configure webhook endpoint
3. Test in Stripe test mode
4. Enable live mode when ready
5. Monitor transactions in Stripe Dashboard
