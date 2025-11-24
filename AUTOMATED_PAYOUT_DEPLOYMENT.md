# Automated Payout System - Complete Deployment Guide

This guide walks you through deploying the automated payout system with daily cron job execution.

---

## Overview

The automated payout system:
- Processes payouts automatically based on user schedules (weekly/monthly)
- Runs daily via cron job at 9 AM UTC
- Checks user thresholds and payout preferences
- Creates Stripe transfers to connected accounts
- Sends email notifications
- Updates earnings and payout records

---

## Step 1: Database Migration

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Add new columns to payouts table
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS payout_type TEXT DEFAULT 'manual' CHECK (payout_type IN ('manual', 'automated'));
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- Add columns to user_preferences for payout settings
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS payout_schedule TEXT DEFAULT 'manual' CHECK (payout_schedule IN ('manual', 'weekly', 'monthly'));
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS payout_threshold DECIMAL(10,2) DEFAULT 50.00;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS payout_currency TEXT DEFAULT 'USD';
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS payout_day INTEGER; -- Day of week (0-6) or day of month (1-31)

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payouts_type ON payouts(payout_type);
CREATE INDEX IF NOT EXISTS idx_payouts_seller_status ON payouts(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_user_preferences_payout_schedule ON user_preferences(payout_schedule);
CREATE INDEX IF NOT EXISTS idx_earnings_seller_status ON earnings(seller_id, status);
```

**Verify migration:**
```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payouts' 
AND column_name IN ('payout_type', 'currency', 'notification_sent');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name IN ('payout_schedule', 'payout_threshold', 'payout_day');
```

---


## Step 2: Deploy Edge Function

The edge function code is in `AUTOMATED_PAYOUT_SYSTEM.md`.

### Using Supabase CLI:

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy process-automated-payouts
```

### Using Supabase Dashboard:

1. Go to Edge Functions in your Supabase Dashboard
2. Click "Create Function"
3. Name it `process-automated-payouts`
4. Copy the code from AUTOMATED_PAYOUT_SYSTEM.md
5. Click "Deploy"

## Step 3: Configure Edge Function Secrets

Before setting up the cron job, ensure all required secrets are configured:

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_key_here

# Set Supabase service role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Set email service key (if using notifications)
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set EMAIL_FROM_ADDRESS=noreply@yourdomain.com
supabase secrets set EMAIL_FROM_NAME=HookDrop

# Verify secrets are set
supabase secrets list
```

---

## Step 4: Set Up Daily Cron Job

### Enable pg_cron Extension

1. Go to **Supabase Dashboard → Database → Extensions**
2. Search for `pg_cron`
3. Click **Enable** if not already enabled
4. Wait for confirmation

### Schedule the Cron Job

Run this SQL in **SQL Editor**:

```sql
-- Enable pg_net extension (required for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily execution at 9 AM UTC
SELECT cron.schedule(
  'process-automated-payouts-daily',
  '0 9 * * *',  -- Cron expression: minute hour day month weekday
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-automated-payouts',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

**Important Replacements:**
- `YOUR_PROJECT_REF`: Your Supabase project reference (e.g., `abcdefghijk`)
  - Find in: Dashboard → Settings → General → Reference ID
- `YOUR_SERVICE_ROLE_KEY`: Your service role key
  - Find in: Dashboard → Settings → API → service_role key (secret)

### Cron Schedule Options

```sql
-- Daily at 9 AM UTC
'0 9 * * *'

-- Every Monday at 9 AM UTC (weekly)
'0 9 * * 1'

-- First day of month at 9 AM UTC (monthly)
'0 9 1 * *'

-- Every 6 hours
'0 */6 * * *'

-- Every hour
'0 * * * *'
```

### Verify Cron Job Created

```sql
-- Check if cron job exists
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  database
FROM cron.job 
WHERE jobname = 'process-automated-payouts-daily';

-- Should return one row with active = true
```

---

---

## Step 5: Test the System

### A. Set Up Test User with Payout Schedule

```sql
-- Get your test user ID first
SELECT id, email FROM auth.users LIMIT 1;

-- Set up automated payout preferences for test user
-- Replace YOUR_TEST_USER_ID with actual user ID
UPDATE user_preferences 
SET 
  payout_schedule = 'weekly',
  payout_day = EXTRACT(DOW FROM CURRENT_DATE)::int,  -- Today's day of week
  payout_threshold = 10.00,  -- Low threshold for testing
  payout_currency = 'USD'
WHERE user_id = 'YOUR_TEST_USER_ID';

-- Verify settings
SELECT 
  user_id,
  payout_schedule,
  payout_day,
  payout_threshold,
  payout_currency
FROM user_preferences 
WHERE user_id = 'YOUR_TEST_USER_ID';
```

### B. Add Test Earnings

```sql
-- Add available earnings for the test user
INSERT INTO earnings (seller_id, amount, status)
VALUES ('YOUR_TEST_USER_ID', 25.00, 'available');

-- Verify earnings
SELECT seller_id, SUM(amount) as total_available
FROM earnings
WHERE seller_id = 'YOUR_TEST_USER_ID' AND status = 'available'
GROUP BY seller_id;
```

### C. Ensure User Has Stripe Connected Account

```sql
-- Check if user has Stripe account connected
SELECT id, username, stripe_account_id, stripe_account_status
FROM profiles
WHERE id = 'YOUR_TEST_USER_ID';

-- If stripe_account_id is NULL, user needs to complete Stripe Connect onboarding
-- User must complete onboarding before automated payouts can work
```

### D. Manual Test Execution

Test the function manually before waiting for cron:

```bash
# Replace YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-automated-payouts \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Success Response:**
```json
{
  "success": true,
  "processed": 1,
  "payouts": [
    {
      "user_id": "...",
      "amount": 25.00,
      "currency": "USD",
      "stripe_transfer_id": "tr_..."
    }
  ],
  "errors": []
}
```

**Expected Response if No Payouts Due:**
```json
{
  "success": true,
  "processed": 0,
  "payouts": [],
  "errors": []
}
```

### E. Verify Payout Created

```sql
-- Check if payout was created
SELECT 
  id,
  seller_id,
  amount,
  currency,
  status,
  payout_type,
  stripe_transfer_id,
  created_at
FROM payouts
WHERE seller_id = 'YOUR_TEST_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

-- Check earnings were marked as paid
SELECT 
  id,
  seller_id,
  amount,
  status,
  payout_id
FROM earnings
WHERE seller_id = 'YOUR_TEST_USER_ID'
ORDER BY created_at DESC;
```

---

---

## Step 6: Monitor Cron Job Execution

### Check Cron Job Status

```sql
-- Verify cron job is active
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  database
FROM cron.job 
WHERE jobname = 'process-automated-payouts-daily';

-- Should show: active = true
```

### View Execution History

```sql
-- Check recent executions
SELECT 
  jr.runid,
  jr.job_pid,
  jr.database,
  jr.username,
  jr.command,
  jr.status,
  jr.return_message,
  jr.start_time,
  jr.end_time
FROM cron.job_run_details jr
JOIN cron.job j ON jr.jobid = j.jobid
WHERE j.jobname = 'process-automated-payouts-daily'
ORDER BY jr.start_time DESC
LIMIT 10;
```

### Check Edge Function Logs

1. Go to **Supabase Dashboard → Edge Functions**
2. Click on `process-automated-payouts`
3. Click **Logs** tab
4. Filter by date/time
5. Look for successful executions or errors

---

## Monitoring Queries

### Check Processed Automated Payouts

```sql
SELECT 
  p.id,
  p.seller_id,
  pr.username,
  pr.email,
  p.amount,
  p.currency,
  p.status,
  p.payout_type,
  p.stripe_transfer_id,
  p.notification_sent,
  p.created_at,
  p.processed_at
FROM payouts p
JOIN profiles pr ON p.seller_id = pr.id
WHERE p.payout_type = 'automated'
ORDER BY p.created_at DESC
LIMIT 20;
```

### Check Users Eligible for Automated Payouts

```sql
SELECT 
  up.user_id,
  pr.username,
  pr.email,
  pr.stripe_account_id,
  pr.stripe_account_status,
  up.payout_schedule,
  up.payout_day,
  up.payout_threshold,
  up.payout_currency,
  SUM(e.amount) as total_available
FROM user_preferences up
JOIN profiles pr ON up.user_id = pr.id
LEFT JOIN earnings e ON e.seller_id = up.user_id AND e.status = 'available'
WHERE up.payout_schedule IN ('weekly', 'monthly')
GROUP BY up.user_id, pr.username, pr.email, pr.stripe_account_id, pr.stripe_account_status,
         up.payout_schedule, up.payout_day, up.payout_threshold, up.payout_currency
HAVING SUM(e.amount) >= up.payout_threshold;
```

### Check Today's Scheduled Payouts

```sql
-- For weekly schedule (checks day of week)
SELECT 
  up.user_id,
  pr.username,
  up.payout_schedule,
  up.payout_day,
  EXTRACT(DOW FROM CURRENT_DATE)::int as today_dow,
  SUM(e.amount) as total_available
FROM user_preferences up
JOIN profiles pr ON up.user_id = pr.id
JOIN earnings e ON e.seller_id = up.user_id AND e.status = 'available'
WHERE up.payout_schedule = 'weekly'
  AND up.payout_day = EXTRACT(DOW FROM CURRENT_DATE)::int
GROUP BY up.user_id, pr.username, up.payout_schedule, up.payout_day;

-- For monthly schedule (checks day of month)
SELECT 
  up.user_id,
  pr.username,
  up.payout_schedule,
  up.payout_day,
  EXTRACT(DAY FROM CURRENT_DATE)::int as today_dom,
  SUM(e.amount) as total_available
FROM user_preferences up
JOIN profiles pr ON up.user_id = pr.id
JOIN earnings e ON e.seller_id = up.user_id AND e.status = 'available'
WHERE up.payout_schedule = 'monthly'
  AND up.payout_day = EXTRACT(DAY FROM CURRENT_DATE)::int
GROUP BY up.user_id, pr.username, up.payout_schedule, up.payout_day;
```

---

## Troubleshooting

### Issue: Cron Job Not Running

**Check:**
```sql
-- Verify pg_cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check cron job exists and is active
SELECT * FROM cron.job WHERE jobname = 'process-automated-payouts-daily';
```

**Fix:**
1. Ensure pg_cron extension is enabled
2. Verify cron job was created successfully
3. Check cron.job_run_details for error messages
4. Verify service role key in cron command is correct

### Issue: Function Executes But No Payouts Created

**Check:**
```sql
-- Verify users have correct settings
SELECT 
  user_id,
  payout_schedule,
  payout_day,
  payout_threshold
FROM user_preferences
WHERE payout_schedule != 'manual';

-- Check if users have available earnings
SELECT 
  seller_id,
  SUM(amount) as total
FROM earnings
WHERE status = 'available'
GROUP BY seller_id;

-- Verify users have Stripe accounts
SELECT 
  id,
  username,
  stripe_account_id,
  stripe_account_status
FROM profiles
WHERE stripe_account_id IS NOT NULL;
```

**Common Issues:**
- User's payout_day doesn't match current day
- Available earnings below threshold
- User hasn't completed Stripe Connect onboarding
- stripe_account_status is not 'active'

### Issue: Payouts Created But Stripe Transfer Fails

**Check Edge Function Logs:**
1. Dashboard → Edge Functions → process-automated-payouts → Logs
2. Look for Stripe API errors

**Common Causes:**
- Invalid Stripe secret key
- Connected account not fully activated
- Insufficient balance (platform account)
- Currency mismatch

**Verify Stripe Settings:**
```bash
# Check secrets are set correctly
supabase secrets list

# Should see:
# - STRIPE_SECRET_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### Issue: Email Notifications Not Sending

**Check:**
```sql
-- Verify notification_sent status
SELECT 
  id,
  seller_id,
  amount,
  notification_sent,
  created_at
FROM payouts
WHERE payout_type = 'automated'
ORDER BY created_at DESC
LIMIT 10;
```

**Fix:**
1. Verify send-email function is deployed
2. Check RESEND_API_KEY or email provider key is set
3. Review send-email function logs
4. Verify EMAIL_FROM_ADDRESS is authorized

---

## Maintenance

### Pause Automated Payouts

```sql
-- Disable the cron job temporarily
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'process-automated-payouts-daily'),
  schedule := NULL
);
```

### Resume Automated Payouts

```sql
-- Re-enable with original schedule
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'process-automated-payouts-daily'),
  schedule := '0 9 * * *'
);
```

### Change Schedule

```sql
-- Update to run twice daily (9 AM and 9 PM UTC)
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'process-automated-payouts-daily'),
  schedule := '0 9,21 * * *'
);
```

### Unschedule Completely

```sql
-- Remove cron job
SELECT cron.unschedule('process-automated-payouts-daily');

-- Verify removed
SELECT * FROM cron.job WHERE jobname = 'process-automated-payouts-daily';
-- Should return no rows
```

---

## Success Indicators

✅ Cron job shows as active in cron.job table  
✅ cron.job_run_details shows successful executions  
✅ Payouts created with payout_type = 'automated'  
✅ Earnings status updated to 'paid'  
✅ Stripe transfers visible in Stripe Dashboard  
✅ Email notifications sent (notification_sent = true)  
✅ No errors in edge function logs  

---

## Next Steps

After successful deployment:

1. **Monitor Daily:** Check cron execution logs daily for first week
2. **User Communication:** Inform sellers about automated payout feature
3. **Documentation:** Update user-facing docs with payout schedule options
4. **Analytics:** Track automated vs manual payout adoption
5. **Optimization:** Adjust thresholds/schedules based on usage patterns

---

## Support

For issues with automated payouts:
- Check `TEST_AUTOMATED_PAYOUTS.md` for testing procedures
- Review Supabase edge function logs
- Check Stripe Dashboard for transfer status
- Verify database records match expected state

**Deployment Complete! 🎉**

Your automated payout system is now live and will process payouts daily at 9 AM UTC.
