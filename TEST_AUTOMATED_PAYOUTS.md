# Testing Automated Payout System

## Quick Test Setup

### 1. Create Test User with Payout Settings

```sql
-- Get your user ID first
SELECT id, email, username FROM profiles WHERE email = 'your-email@example.com';

-- Set up automated weekly payouts (runs today)
UPDATE user_preferences 
SET payout_settings = jsonb_build_object(
  'auto_payout_enabled', true,
  'payout_schedule', 'weekly',
  'payout_day', EXTRACT(DOW FROM CURRENT_DATE)::int,
  'minimum_threshold', 10,
  'currency', 'USD'
)
WHERE user_id = 'YOUR_USER_ID';

-- If no user_preferences record exists, insert one:
INSERT INTO user_preferences (user_id, payout_settings)
VALUES (
  'YOUR_USER_ID',
  jsonb_build_object(
    'auto_payout_enabled', true,
    'payout_schedule', 'weekly',
    'payout_day', EXTRACT(DOW FROM CURRENT_DATE)::int,
    'minimum_threshold', 10,
    'currency', 'USD'
  )
);
```

### 2. Add Test Earnings

```sql
-- Add available earnings above threshold
INSERT INTO earnings (seller_id, amount, status, hook_id, buyer_id, created_at)
VALUES 
  ('YOUR_USER_ID', 15.00, 'available', 'test-hook-1', 'test-buyer-1', NOW()),
  ('YOUR_USER_ID', 20.00, 'available', 'test-hook-2', 'test-buyer-2', NOW());

-- Verify earnings were added
SELECT * FROM earnings WHERE seller_id = 'YOUR_USER_ID' AND status = 'available';
```

### 3. Verify Stripe Connect Setup

```sql
-- Check if user has Stripe account connected
SELECT id, username, email, stripe_account_id 
FROM profiles 
WHERE id = 'YOUR_USER_ID';
```

**Important:** User must have a valid `stripe_account_id` for payouts to work!

### 4. Test Function Manually

```bash
# Replace with your project details
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-automated-payouts \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 5. Verify Results

```sql
-- Check if payout was created
SELECT * FROM payouts 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if earnings were marked as paid
SELECT * FROM earnings 
WHERE seller_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC;

-- Check payout details
SELECT 
  p.id,
  p.amount,
  p.status,
  p.payout_type,
  p.currency,
  p.stripe_transfer_id,
  p.processed_at,
  p.notification_sent
FROM payouts p
WHERE p.user_id = 'YOUR_USER_ID' AND p.payout_type = 'automated';
```

## Test Different Schedules

### Weekly Payout (Every Monday)

```sql
UPDATE user_preferences 
SET payout_settings = jsonb_build_object(
  'auto_payout_enabled', true,
  'payout_schedule', 'weekly',
  'payout_day', 1,  -- Monday (0=Sunday, 1=Monday, etc.)
  'minimum_threshold', 50,
  'currency', 'USD'
)
WHERE user_id = 'YOUR_USER_ID';
```

### Monthly Payout (1st of month)

```sql
UPDATE user_preferences 
SET payout_settings = jsonb_build_object(
  'auto_payout_enabled', true,
  'payout_schedule', 'monthly',
  'payout_day', 1,  -- 1st day of month
  'minimum_threshold', 100,
  'currency', 'USD'
)
WHERE user_id = 'YOUR_USER_ID';
```

## Verify Email Notifications

Check if email was sent:

```sql
-- Check notification_sent flag
SELECT id, amount, notification_sent, processed_at 
FROM payouts 
WHERE user_id = 'YOUR_USER_ID' AND payout_type = 'automated'
ORDER BY created_at DESC;
```

## Test Edge Cases

### Below Minimum Threshold

```sql
-- Set high threshold
UPDATE user_preferences 
SET payout_settings = jsonb_build_object(
  'auto_payout_enabled', true,
  'payout_schedule', 'weekly',
  'payout_day', EXTRACT(DOW FROM CURRENT_DATE)::int,
  'minimum_threshold', 1000,  -- Very high
  'currency', 'USD'
)
WHERE user_id = 'YOUR_USER_ID';

-- Run function - should NOT process payout
```

### No Stripe Account

```sql
-- Temporarily remove Stripe account
UPDATE profiles SET stripe_account_id = NULL WHERE id = 'YOUR_USER_ID';

-- Run function - should skip this user
-- Restore after test
UPDATE profiles SET stripe_account_id = 'acct_xxx' WHERE id = 'YOUR_USER_ID';
```

### Disabled Auto Payout

```sql
-- Disable auto payout
UPDATE user_preferences 
SET payout_settings = jsonb_set(
  payout_settings, 
  '{auto_payout_enabled}', 
  'false'
)
WHERE user_id = 'YOUR_USER_ID';

-- Run function - should skip this user
```

## Cleanup Test Data

```sql
-- Remove test earnings
DELETE FROM earnings WHERE hook_id LIKE 'test-hook-%';

-- Remove test payouts
DELETE FROM payouts WHERE user_id = 'YOUR_USER_ID' AND payout_type = 'automated';

-- Reset payout settings
UPDATE user_preferences 
SET payout_settings = jsonb_build_object(
  'auto_payout_enabled', false
)
WHERE user_id = 'YOUR_USER_ID';
```

## Expected Function Response

Success:
```json
{
  "success": true,
  "processed": 1,
  "payouts": [
    {
      "user_id": "uuid-here",
      "amount": 35.00
    }
  ],
  "errors": []
}
```

With errors:
```json
{
  "success": true,
  "processed": 1,
  "payouts": [...],
  "errors": [
    {
      "user_id": "uuid-here",
      "error": "No Stripe account connected"
    }
  ]
}
```
