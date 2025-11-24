# HookDrop - Launch Readiness Checklist

## 🎯 Mission: Get HookDrop Live

This checklist ensures all systems are connected and ready for launch.

---

## Phase 1: Local Development Setup ✅

### Supabase Connection
- [ ] Supabase project created
- [ ] `.env` file created with credentials
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] Dev server restarted after .env changes
- [ ] No "Supabase not configured" warnings in console

**Test:** Open app, check browser console for errors

### Database Setup
- [ ] Database schema migrated (run initial_schema.sql)
- [ ] All tables created (profiles, hooks, purchases, etc.)
- [ ] RLS policies enabled on all tables
- [ ] Indexes created for performance
- [ ] Can query tables in SQL Editor

**Test:** Run `SELECT * FROM profiles LIMIT 1;` in SQL Editor

### Storage Setup
- [ ] `hooks` bucket created
- [ ] Bucket set to Public
- [ ] Upload policy configured
- [ ] View policy configured
- [ ] Delete policy configured

**Test:** Try uploading a file in Storage UI

### Authentication
- [ ] Email provider enabled
- [ ] Can sign up new account
- [ ] Can log in with credentials
- [ ] Can log out
- [ ] Profile created automatically on signup

**Test:** Create test account, verify in auth.users table

---

## Phase 2: Core Features Working 🎵

### Upload System
- [ ] Can select audio file
- [ ] File uploads to storage
- [ ] Hook record created in database
- [ ] Metadata saved correctly
- [ ] Audio playable after upload

**Test:** Upload a test audio file

### Marketplace
- [ ] Hooks display on homepage
- [ ] Can search/filter hooks
- [ ] Audio player works
- [ ] Can view hook details
- [ ] Like/play counts update

**Test:** Browse marketplace, play audio

### User Profiles
- [ ] Can view own profile
- [ ] Can edit profile info
- [ ] Avatar upload works
- [ ] Can view other user profiles
- [ ] Shows user's uploaded hooks

**Test:** Update profile, upload avatar

---

## Phase 3: Payment System 💳

### Stripe Account Setup
- [ ] Stripe account created
- [ ] Test mode enabled for development
- [ ] API keys obtained
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` in .env
- [ ] Test key starts with `pk_test_`

### Stripe Connect
- [ ] Connect enabled in Stripe Dashboard
- [ ] Redirect URIs configured
- [ ] Can start onboarding flow
- [ ] Onboarding completes successfully
- [ ] Dashboard link works

**Test:** Complete seller onboarding

### Checkout Flow
- [ ] Can add hook to cart
- [ ] Checkout button works
- [ ] Redirects to Stripe
- [ ] Can complete test purchase
- [ ] Returns to success page

**Test:** Buy a hook with test card 4242 4242 4242 4242

### Webhook Setup
- [ ] Webhook endpoint created in Stripe
- [ ] URL: `https://[project].supabase.co/functions/v1/stripe-webhook`
- [ ] Events selected: `checkout.session.completed`
- [ ] Webhook secret saved
- [ ] Test webhook sends successfully

**Test:** Send test webhook from Stripe Dashboard

---

## Phase 4: Edge Functions Deployed 🚀

### Required Functions
- [ ] `create-checkout-session` deployed
- [ ] `stripe-webhook` deployed
- [ ] `create-connect-account` deployed
- [ ] `create-dashboard-link` deployed
- [ ] `send-email` deployed (optional)
- [ ] `process-automated-payouts` deployed (optional)

### Function Secrets
- [ ] `STRIPE_SECRET_KEY` set
- [ ] `STRIPE_WEBHOOK_SECRET` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] Email API key set (if using email)

**Deploy Command:**
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
# ... deploy others
```

**Test:** Call function via API or trigger via app

---

## Phase 5: Email System (Optional) 📧

### Email Provider
- [ ] Provider chosen (Resend or SendGrid)
- [ ] Account created
- [ ] Domain verified
- [ ] DNS records configured
- [ ] API key obtained
- [ ] Test email sent successfully

### Email Templates
- [ ] Welcome email works
- [ ] Purchase confirmation works
- [ ] License delivery works
- [ ] Payout notification works

**Test:** Trigger each email type

---

## Phase 6: Production Preparation 🏭

### Environment Variables
- [ ] `.env.production` created
- [ ] Live Stripe keys obtained
- [ ] `pk_live_` publishable key set
- [ ] `sk_live_` secret key set
- [ ] Production URL configured
- [ ] All secrets in `.gitignore`

### Security Audit
- [ ] No secrets in git history
- [ ] RLS policies tested
- [ ] Service role key never exposed to frontend
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection prevention verified

### Performance
- [ ] Database indexes created
- [ ] Images optimized
- [ ] Audio files compressed
- [ ] Lighthouse score > 90
- [ ] Page load < 3 seconds

---

## Phase 7: Deployment 🌐

### Build & Test
- [ ] Production build succeeds
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] All features work in build

```bash
npm run build
npm run preview
```

### Hosting Setup
- [ ] Hosting provider chosen (Vercel/Netlify)
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Build settings configured
- [ ] Custom domain configured (optional)

### Deploy
- [ ] First deployment successful
- [ ] Site accessible at URL
- [ ] Can sign up on live site
- [ ] Can make test purchase
- [ ] Webhooks receiving events

---

## Phase 8: Post-Launch Verification ✨

### Smoke Tests
- [ ] Homepage loads
- [ ] Can sign up
- [ ] Can log in
- [ ] Can upload hook
- [ ] Can purchase hook
- [ ] Webhook processes payment
- [ ] License generated
- [ ] Email sent (if configured)

### Monitoring
- [ ] Check Supabase logs
- [ ] Check Stripe webhook logs
- [ ] Check email delivery logs
- [ ] Monitor error rates
- [ ] Check database performance

### User Testing
- [ ] Create real account
- [ ] Upload real audio
- [ ] Make small real purchase
- [ ] Verify entire flow works
- [ ] Check seller receives earnings

---

## 🚨 Critical Issues Checklist

Before launch, ensure NONE of these are true:

- [ ] ❌ Test Stripe keys in production
- [ ] ❌ Secrets committed to git
- [ ] ❌ RLS policies disabled
- [ ] ❌ Service role key exposed
- [ ] ❌ No webhook configured
- [ ] ❌ Storage bucket private
- [ ] ❌ Email not working
- [ ] ❌ Broken payment flow

---

## 📊 Success Metrics

After launch, you should see:

✅ Users can sign up  
✅ Users can upload hooks  
✅ Users can purchase hooks  
✅ Payments process successfully  
✅ Licenses generated automatically  
✅ Sellers receive earnings  
✅ Webhooks deliver reliably  
✅ No critical errors in logs  

---

## 🎉 You're Ready to Launch!

Once all checkboxes are complete:

1. **Final Review:** Double-check critical items
2. **Backup:** Export database schema
3. **Monitor:** Watch logs closely for first 24 hours
4. **Support:** Be ready to help early users
5. **Iterate:** Gather feedback and improve

---

## 📞 Quick Reference

### Important URLs
- Supabase Dashboard: https://supabase.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com
- Your App (Dev): http://localhost:5173
- Your App (Prod): https://yourdomain.com

### Important Commands
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy function
supabase functions deploy function-name

# Set secret
supabase secrets set KEY=value

# View logs
supabase functions logs function-name
```

### Support Docs
- `SUPABASE_CONNECTION_GUIDE.md` - Connection help
- `STRIPE_PAYMENT_INTEGRATION.md` - Payment setup
- `DEPLOYMENT_GUIDE.md` - Deployment steps
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Full checklist

---

## 🚀 Launch Day Protocol

1. ✅ Complete all checklist items
2. 🧪 Run final smoke tests
3. 📊 Set up monitoring
4. 🚀 Deploy to production
5. 🔍 Watch logs for 1 hour
6. 📧 Send announcement
7. 💪 You did it!

**Good luck with your launch! 🎉**
