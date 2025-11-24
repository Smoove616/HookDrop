# HookDrop - Quick Start Guide

## 🚀 Get HookDrop Running in 10 Minutes

Follow these steps to get your local development environment up and running.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free)
- A Stripe account (free, test mode)

---

## Step 1: Install Dependencies (2 minutes)

```bash
# Clone or navigate to project directory
cd hookdrop

# Install packages
npm install

# This installs React, Vite, Supabase, Stripe, and all dependencies
```

---

## Step 2: Set Up Supabase (3 minutes)

### Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Name: **HookDrop**
4. Create a strong database password (save it!)
5. Choose region closest to you
6. Click "Create new project" (wait 2-3 min)

### Get API Keys
1. Once ready, go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...`

### Create .env File
```bash
# Create .env file in project root
touch .env

# Add these lines (replace with your actual values):
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

---

## Step 3: Set Up Database (2 minutes)

### Run Migration
1. In Supabase Dashboard, click **SQL Editor**
2. Click **New Query**
3. Copy contents from: `supabase/migrations/20240101000000_initial_schema.sql`
4. Paste into editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for "Success" message

### Create Storage Bucket
1. Click **Storage** in sidebar
2. Click **Create a new bucket**
3. Name: `hooks`
4. Make it **Public**
5. Click **Create bucket**

---

## Step 4: Start Development Server (1 minute)

```bash
# Start the app
npm run dev

# You should see:
# ➜ Local: http://localhost:5173/
```

Open your browser to: **http://localhost:5173**

---

## Step 5: Test It Works (2 minutes)

### Sign Up Test
1. Click "Sign Up" in the app
2. Enter email and password
3. Click "Create Account"
4. If successful, you're connected! ✅

### Verify in Supabase
1. Go to Supabase Dashboard → **Authentication**
2. You should see your new user
3. Go to **Table Editor** → **profiles**
4. Your profile should be there

---

## ✅ You're Ready!

Your HookDrop development environment is now running. You can:

- ✅ Sign up and log in
- ✅ Browse the marketplace
- ✅ View profiles
- ✅ Play audio (with sample data)

---

## Next Steps

### Add Sample Data (Optional)
```sql
-- In Supabase SQL Editor, run:
-- See SAMPLE_HOOKS_SETUP.md for sample data
```

### Set Up Payments (Required for purchases)
1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get test API keys
3. Update `.env` with Stripe key
4. Follow `STRIPE_PAYMENT_INTEGRATION.md`

### Deploy Edge Functions (Required for purchases)
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-id

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

---

## Common Issues & Fixes

### "Supabase not configured" warning
**Fix:** 
1. Check `.env` file exists
2. Verify no typos in URL/key
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Can't sign up
**Fix:**
1. Check database migration ran successfully
2. Verify Email auth is enabled in Supabase
3. Check browser console for errors

### Page is blank
**Fix:**
1. Check browser console for errors
2. Verify all dependencies installed: `npm install`
3. Try clearing browser cache

### Port 5173 already in use
**Fix:**
```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

---

## Development Tips

### Hot Reload
- Changes to code auto-refresh browser
- Changes to .env require server restart

### View Database
- Use Supabase Table Editor
- Or use SQL Editor for queries

### Debug
- Open browser DevTools (F12)
- Check Console for errors
- Check Network tab for API calls

### Reset Database
```sql
-- In SQL Editor, to start fresh:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run migration
```

---

## File Structure

```
hookdrop/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── lib/           # Utilities
│   └── main.tsx       # App entry point
├── supabase/
│   ├── functions/     # Edge functions
│   └── migrations/    # Database schemas
├── .env               # Your local config
└── package.json       # Dependencies
```

---

## Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint
```

---

## Getting Help

### Documentation
- `SUPABASE_CONNECTION_GUIDE.md` - Detailed Supabase setup
- `STRIPE_PAYMENT_INTEGRATION.md` - Payment setup
- `LAUNCH_READINESS_CHECKLIST.md` - Pre-launch checklist
- `DEPLOYMENT_GUIDE.md` - Deploy to production

### Support
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Stripe Docs: [stripe.com/docs](https://stripe.com/docs)
- React Docs: [react.dev](https://react.dev)

### Community
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- Stripe Discord: [stripe.com/discord](https://stripe.com/discord)

---

## What's Next?

Now that you have HookDrop running locally:

1. **Explore the app** - Browse, play audio, test features
2. **Set up Stripe** - Enable purchases (see STRIPE_PAYMENT_INTEGRATION.md)
3. **Deploy functions** - Make payments work (see DEPLOYMENT_GUIDE.md)
4. **Customize** - Add your branding, modify features
5. **Deploy** - Launch to production (see LAUNCH_READINESS_CHECKLIST.md)

---

## 🎉 Happy Building!

You now have a fully functional music marketplace running locally. Time to make it your own!

**Questions?** Check the other .md files in the project root for detailed guides on specific topics.
