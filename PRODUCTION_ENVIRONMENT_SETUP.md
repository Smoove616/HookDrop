# Production Environment Variables Setup

## Required Environment Variables

Create a `.env.production` file with the following variables. Replace placeholder values with your actual production credentials.

---

## Supabase Configuration

```bash
# Supabase Project URL
# Get from: Supabase Dashboard > Project Settings > API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Anon/Public Key
# Get from: Supabase Dashboard > Project Settings > API > anon public
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (for Edge Functions only, NEVER expose to frontend)
# Get from: Supabase Dashboard > Project Settings > API > service_role
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Stripe Configuration

```bash
# Stripe Publishable Key (Live Mode)
# Get from: Stripe Dashboard > Developers > API Keys (toggle to Live mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51...

# Stripe Secret Key (Live Mode) - NEVER expose to frontend
# Get from: Stripe Dashboard > Developers > API Keys
STRIPE_SECRET_KEY=sk_live_51...

# Stripe Webhook Signing Secret
# Get from: Stripe Dashboard > Developers > Webhooks > Add endpoint
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Connect Client ID
# Get from: Stripe Dashboard > Connect > Settings
STRIPE_CONNECT_CLIENT_ID=ca_...
```

---

## Email Service Configuration

### Option A: SendGrid

```bash
EMAIL_SERVICE_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=HookDrop
```

### Option B: Resend

```bash
EMAIL_SERVICE_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=HookDrop
```

---

## Application Configuration

```bash
# Application URL (your production domain)
VITE_APP_URL=https://yourdomain.com

# Environment
NODE_ENV=production

# API Base URL (if different from app URL)
VITE_API_URL=https://api.yourdomain.com
```

---

## Optional: Analytics & Monitoring

```bash
# Sentry (Error Tracking)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Google Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Mixpanel
VITE_MIXPANEL_TOKEN=your_mixpanel_token
```

---

## Supabase Edge Function Secrets

These are set separately using Supabase CLI:

```bash
# Set secrets for edge functions
supabase secrets set STRIPE_SECRET_KEY=sk_live_51...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set EMAIL_SERVICE_API_KEY=your_email_api_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Verify secrets are set
supabase secrets list
```

---

## Vercel Environment Variables

If deploying to Vercel, add these in the dashboard:

1. Go to Project Settings > Environment Variables
2. Add each variable with appropriate scope:
   - **Production**: Live environment
   - **Preview**: Staging/preview deployments
   - **Development**: Local development

**Important:** 
- Prefix frontend variables with `VITE_`
- Never expose secret keys (STRIPE_SECRET_KEY, etc.) to frontend
- Use different keys for preview/staging environments

---

## Netlify Environment Variables

If deploying to Netlify:

1. Go to Site Settings > Build & Deploy > Environment
2. Add each variable
3. Mark sensitive variables as "Secret"

---

## Security Checklist

- [ ] All production keys are different from development/test keys
- [ ] No secrets committed to git repository
- [ ] `.env.production` added to `.gitignore`
- [ ] Service role key only used in backend/edge functions
- [ ] Stripe webhook secret matches production webhook endpoint
- [ ] Email service domain verified
- [ ] CORS configured to allow only production domain
- [ ] All API keys have appropriate permissions (principle of least privilege)

---

## Testing Your Configuration

### 1. Test Supabase Connection
```bash
# In your browser console on production site:
console.log(import.meta.env.VITE_SUPABASE_URL)
# Should show your production URL
```

### 2. Test Stripe Connection
- Make a test purchase with a real card (small amount)
- Check Stripe Dashboard > Payments for the transaction
- Verify webhook received the event

### 3. Test Email Service
- Sign up for a new account
- Verify email is received
- Check email service dashboard for delivery status

### 4. Test Edge Functions
```bash
# Test webhook endpoint
curl -X POST https://your-project.supabase.co/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## Troubleshooting

### "Invalid API Key" Error
- Verify you're using live mode keys (not test mode)
- Check for extra spaces or newlines in .env file
- Ensure keys haven't been regenerated in Stripe dashboard

### Webhook Not Receiving Events
- Verify webhook URL is correct in Stripe dashboard
- Check webhook signing secret matches
- Ensure endpoint is publicly accessible
- Review Stripe webhook logs for errors

### Email Not Sending
- Verify domain is verified with email provider
- Check API key has send permissions
- Review email service logs
- Verify from address is authorized

### Supabase Connection Failed
- Check project URL is correct
- Verify anon key is for production project
- Ensure project is not paused
- Check Supabase status page

---

## Rotating Secrets

### When to Rotate:
- Suspected compromise
- Team member departure
- Regular security maintenance (quarterly)
- After security audit

### How to Rotate:

**Stripe Keys:**
1. Generate new keys in Stripe Dashboard
2. Update environment variables
3. Deploy new version
4. Delete old keys after 24 hours

**Supabase Keys:**
1. Generate new anon key in dashboard
2. Update environment variables
3. Deploy new version
4. Old key automatically invalidated

**Email API Keys:**
1. Generate new key in provider dashboard
2. Update environment variables
3. Deploy new version
4. Delete old key

---

## Backup Configuration

Keep a secure backup of your production configuration:

1. Use a password manager (1Password, LastPass)
2. Store encrypted backup in secure location
3. Document who has access
4. Review access quarterly

**Never:**
- Email credentials
- Store in Slack/Discord
- Commit to git
- Share via insecure channels

---

## Support

For environment setup issues:
- Email: devops@hookdrop.com
- Supabase: support@supabase.io
- Stripe: https://support.stripe.com
