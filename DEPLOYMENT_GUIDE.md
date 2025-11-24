# HookDrop Production Deployment Guide

## Prerequisites Checklist

Before deploying to production, ensure you have:

- [ ] Supabase production project created
- [ ] Stripe account in live mode
- [ ] Email service provider account (SendGrid/Resend)
- [ ] Custom domain purchased
- [ ] Hosting platform account (Vercel/Netlify recommended)

## Step 1: Supabase Production Setup

### 1.1 Create Production Project
1. Go to https://supabase.com/dashboard
2. Create a new project (select closest region to your users)
3. Wait for project initialization (~2 minutes)
4. Note down your project URL and anon key

### 1.2 Run Database Migrations
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Push database schema
supabase db push

# Run all SQL setup files in order:
# - DATABASE_SETUP.md
# - STRIPE_CONNECT_SETUP.md
# - SUBSCRIPTION_DEPLOYMENT_GUIDE.md
# - DISPUTE_RESOLUTION_SYSTEM.md
# - PLAYLIST_COLLABORATION_SETUP.md
# - VERSION_CONTROL_SETUP.md
# - MULTI_CURRENCY_PAYOUT_SYSTEM.md
```

### 1.3 Configure Storage Buckets
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('hooks', 'hooks', false),
  ('avatars', 'avatars', true),
  ('playlist-covers', 'playlist-covers', true);

-- Set up storage policies (see DATABASE_SETUP.md)
```

### 1.4 Enable Required Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## Step 2: Stripe Production Configuration

### 2.1 Switch to Live Mode
1. Log into Stripe Dashboard
2. Toggle from "Test mode" to "Live mode" (top right)
3. Complete business verification if required

### 2.2 Get Production API Keys
1. Go to Developers > API Keys
2. Copy your Live mode keys:
   - Publishable key (starts with `pk_live_`)
   - Secret key (starts with `sk_live_`)

### 2.3 Configure Stripe Connect
1. Go to Connect > Settings
2. Enable Stripe Connect
3. Configure branding and policies
4. Set redirect URLs to your production domain

### 2.4 Set Up Production Webhooks
1. Go to Developers > Webhooks
2. Add endpoint: `https://YOUR_DOMAIN.com/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `payout.paid`
4. Copy webhook signing secret (starts with `whsec_`)

## Step 3: Email Service Setup

### Option A: SendGrid
1. Sign up at https://sendgrid.com
2. Verify your domain
3. Create API key with "Mail Send" permissions
4. Configure sender authentication
5. Note your API key

### Option B: Resend
1. Sign up at https://resend.com
2. Verify your domain
3. Create API key
4. Note your API key

## Step 4: Environment Variables

Create `.env.production` file:

```bash
# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
STRIPE_CONNECT_CLIENT_ID=ca_YOUR_CLIENT_ID

# Email Service
EMAIL_SERVICE_API_KEY=your_email_api_key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=HookDrop

# Application
VITE_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Step 5: Deploy Edge Functions

```bash
# Deploy all Supabase Edge Functions
supabase functions deploy stripe-webhook
supabase functions deploy create-subscription
supabase functions deploy manage-billing-portal
supabase functions deploy get-subscription-analytics
supabase functions deploy invite-playlist-collaborator

# Set secrets for edge functions
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
supabase secrets set EMAIL_SERVICE_API_KEY=your_email_key
```

## Step 6: Deploy Frontend

### Using Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

### Using Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

## Step 7: Domain Configuration

### 7.1 Configure DNS
Point your domain to hosting provider:
- Vercel: Add CNAME record to `cname.vercel-dns.com`
- Netlify: Add CNAME record to your Netlify subdomain

### 7.2 SSL Certificate
Both Vercel and Netlify automatically provision SSL certificates.
Wait 5-10 minutes for propagation.

### 7.3 Update Supabase Redirect URLs
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your production domain to allowed redirect URLs
3. Update site URL to your production domain

## Step 8: Testing Checklist

### 8.1 Authentication
- [ ] User signup works
- [ ] Email verification sends
- [ ] Login works
- [ ] Password reset works
- [ ] OAuth providers work (if configured)

### 8.2 Payments
- [ ] Test small purchase with real card
- [ ] Verify webhook receives events
- [ ] Check transaction appears in Stripe dashboard
- [ ] Verify seller receives payout notification

### 8.3 Core Features
- [ ] Upload hook (with real audio file)
- [ ] Purchase hook
- [ ] Download purchased content
- [ ] Create playlist
- [ ] Submit dispute
- [ ] Verify license works

### 8.4 Email Notifications
- [ ] Welcome email sends
- [ ] Purchase confirmation sends
- [ ] Payout notification sends
- [ ] Dispute notification sends

## Step 9: Monitoring Setup

### 9.1 Error Tracking (Sentry)
```bash
npm install @sentry/react

# Add to main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 9.2 Analytics
Consider adding:
- Google Analytics
- Mixpanel
- PostHog

### 9.3 Uptime Monitoring
Set up monitoring with:
- UptimeRobot
- Pingdom
- Better Uptime

## Step 10: Launch Checklist

- [ ] All environment variables set correctly
- [ ] Database migrations completed
- [ ] Stripe webhooks receiving events
- [ ] Email service sending successfully
- [ ] SSL certificate active
- [ ] Legal pages accessible (/terms, /privacy, /refunds)
- [ ] Test transactions completed successfully
- [ ] Error tracking configured
- [ ] Backups enabled in Supabase
- [ ] Team has access to all dashboards
- [ ] Support email configured
- [ ] Documentation updated with production URLs

## Post-Launch

### Week 1
- Monitor error logs daily
- Check webhook delivery in Stripe
- Verify email delivery rates
- Test all critical user flows

### Ongoing
- Weekly database backups review
- Monthly security audit
- Quarterly dependency updates
- Regular performance monitoring

## Rollback Plan

If critical issues arise:

1. **Immediate**: Revert to previous Vercel/Netlify deployment
2. **Database**: Restore from Supabase backup (Point-in-time recovery)
3. **Stripe**: Webhooks can be replayed from dashboard
4. **Communication**: Email users about maintenance

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Vercel Docs: https://vercel.com/docs
- HookDrop Discord: [Your support channel]

## Emergency Contacts

- Technical Lead: [Email]
- DevOps: [Email]
- Stripe Support: https://support.stripe.com
- Supabase Support: support@supabase.io
