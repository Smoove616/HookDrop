# Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

#### Development Environment
- [ ] `.env` uses TEST Stripe keys (pk_test_...)
- [ ] `.env` file added to `.gitignore`
- [ ] No live keys in development environment

#### Production Environment
- [ ] `.env.production` created with LIVE keys
- [ ] All placeholder values replaced
- [ ] File added to `.gitignore`
- [ ] Email service configured (Resend or SendGrid)

**Files to configure:**
```bash
.env                    # Development (TEST keys)
.env.production         # Production (LIVE keys)
```

---

### 2. Supabase Configuration

#### Database
- [ ] All migrations applied
- [ ] RLS policies enabled on all tables
- [ ] Storage buckets created (hooks, avatars)
- [ ] Storage policies configured

#### Edge Functions (20 total)
- [ ] All functions deployed
- [ ] Secrets configured in Supabase
- [ ] Functions tested with production data

**Deploy all functions:**
```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-connect-account
supabase functions deploy create-dashboard-link
supabase functions deploy send-email
# ... (deploy all 20 functions)
```

#### Secrets Configuration
```bash
# Set production secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set EMAIL_SERVICE_PROVIDER=resend
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set EMAIL_FROM_ADDRESS=noreply@yourdomain.com
supabase secrets set EMAIL_FROM_NAME=HookDrop
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Verify secrets
supabase secrets list
```

---

### 3. Stripe Configuration

#### API Keys
- [ ] Live mode enabled in Stripe Dashboard
- [ ] Live publishable key (pk_live_...) in .env.production
- [ ] Live secret key (sk_live_...) in Supabase secrets
- [ ] Test keys removed from production

#### Webhooks
- [ ] Webhook endpoint created for production URL
- [ ] Webhook URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- [ ] Events selected: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Webhook secret saved in Supabase secrets

#### Stripe Connect
- [ ] Connect settings configured
- [ ] Redirect URIs set for production domain
- [ ] Branding/logo uploaded
- [ ] Connect client ID saved

---

### 4. Email Service Setup

#### Provider Setup (Choose one)
- [ ] Domain verified with email provider
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] API key generated
- [ ] Test email sent successfully

#### Function Deployment
- [ ] `send-email` edge function deployed
- [ ] Email templates tested
- [ ] Deliverability verified

**See:** `EMAIL_SERVICE_SETUP.md` for detailed instructions

---

### 5. Security Hardening

#### API Security
- [ ] RLS policies tested and verified
- [ ] Service role key never exposed to frontend
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled on edge functions

#### Code Security
- [ ] No secrets in git repository
- [ ] No console.log with sensitive data
- [ ] Error messages don't expose system details
- [ ] SQL injection prevention verified

#### Run Security Audit
```bash
npm audit
npm audit fix
```

---

### 6. Testing

#### Payment Flow
- [ ] Test purchase with real card (small amount)
- [ ] Verify webhook receives event
- [ ] Check license generated correctly
- [ ] Confirm email sent to buyer

#### Stripe Connect
- [ ] Test seller onboarding flow
- [ ] Verify dashboard link works
- [ ] Test payout to connected account
- [ ] Check platform fee calculation (10%)

#### User Flow
- [ ] Sign up new account
- [ ] Upload hook
- [ ] Purchase hook
- [ ] Leave review
- [ ] Request payout

---

### 7. Monitoring & Analytics

#### Error Tracking (Optional but recommended)
- [ ] Sentry configured
- [ ] Error alerts set up
- [ ] Performance monitoring enabled

#### Analytics (Optional)
- [ ] Google Analytics configured
- [ ] Conversion tracking set up
- [ ] Custom events implemented

---

### 8. Frontend Deployment

#### Build Configuration
```bash
# Test production build locally
npm run build
npm run preview
```

#### Vercel Deployment
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy to production
4. Configure custom domain

#### Netlify Deployment
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables
5. Deploy to production

---

### 9. Domain & SSL

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] DNS records pointing to hosting provider
- [ ] www redirect configured (if needed)

---

### 10. Post-Deployment Verification

#### Smoke Tests
- [ ] Homepage loads correctly
- [ ] User can sign up
- [ ] User can upload hook
- [ ] Payment flow works
- [ ] Emails are delivered
- [ ] Stripe Connect onboarding works

#### Performance
- [ ] Lighthouse score > 90
- [ ] Page load time < 3 seconds
- [ ] Images optimized
- [ ] No console errors

#### Monitoring
- [ ] Check Supabase logs for errors
- [ ] Monitor Stripe webhook deliveries
- [ ] Check email deliverability rates
- [ ] Monitor error tracking dashboard

---

## 🚀 Deployment Commands

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

---

## 📋 Environment Variables Quick Reference

### Frontend (.env.production)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Supabase Secrets
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_SERVICE_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## 🆘 Rollback Plan

If issues occur after deployment:

1. **Revert to Previous Version**
   ```bash
   # Vercel
   vercel rollback
   
   # Netlify
   netlify deploy --alias previous-deploy-id
   ```

2. **Check Logs**
   ```bash
   # Supabase edge functions
   supabase functions logs
   
   # Stripe webhooks
   # Check Stripe Dashboard > Developers > Webhooks > Logs
   ```

3. **Disable Features**
   - Temporarily disable payments if needed
   - Show maintenance message
   - Fix issues in development
   - Redeploy when ready

---

## 📞 Support Resources

- **Supabase:** support@supabase.io
- **Stripe:** https://support.stripe.com
- **Resend:** support@resend.com
- **SendGrid:** https://support.sendgrid.com

---

## ✨ You're Ready!

Once all checkboxes are complete, you're ready to deploy HookDrop to production! 🎉
