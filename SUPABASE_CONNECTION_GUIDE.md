# HookDrop - Supabase Connection & Launch Guide

## 🚀 Quick Start: Connect Supabase in 5 Minutes

### Step 1: Create Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: HookDrop
   - **Database Password**: Create strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes 2-3 minutes)

### Step 2: Get Your API Keys
1. Once ready, click **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (long string)

### Step 3: Update Your .env File
1. Open `.env` file in your project root
2. Replace the placeholder values:
```env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key
```
3. Save the file

### Step 4: Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 5: Verify Connection
1. Open app in browser: `http://localhost:5173`
2. Open browser console (F12)
3. Look for: ✅ No Supabase errors
4. Try signing up - if it works, you're connected! 🎉

---

## 🔧 Troubleshooting Connection Issues

### Issue: "Supabase not configured" Warning

**Solution:**
1. Check `.env` file exists in project root
2. Verify no extra spaces in URL or key
3. Ensure you restarted dev server after editing .env
4. Check file is named `.env` (not `.env.txt`)

### Issue: "Invalid API Key" Error

**Solution:**
1. Verify you copied the **anon public** key (not service_role)
2. Check for line breaks in the key
3. Ensure key starts with `eyJhbGci`
4. Generate new key in Supabase Dashboard if needed

### Issue: "Failed to fetch" or CORS Error

**Solution:**
1. Check Supabase project is not paused
2. Verify URL format: `https://xxxxx.supabase.co` (no trailing slash)
3. Check internet connection
4. Try accessing Supabase URL directly in browser

### Issue: Can't Sign Up / Authentication Error

**Solution:**
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Check **Email Auth** settings allow signups
4. Verify database schema is set up (see below)

---

## 📊 Database Setup (REQUIRED)

After connecting, you MUST set up the database schema:

### Run Database Migration

1. In Supabase Dashboard, click **SQL Editor**
2. Click **New Query**
3. Copy and paste the migration from `supabase/migrations/20240101000000_initial_schema.sql`
4. Click **Run** (or Ctrl+Enter)
5. Wait for "Success" message

**Or use the file:** `SUPABASE_DATABASE_SETUP.md` for complete schema

---

## 🪣 Storage Setup (REQUIRED for Audio Uploads)

### Create Storage Bucket

1. In Supabase Dashboard, click **Storage**
2. Click **Create a new bucket**
3. Name: `hooks`
4. Make it **Public**
5. Click **Create bucket**

### Set Storage Policies

1. Click on `hooks` bucket → **Policies**
2. Click **New Policy** → **For full customization**
3. Add these three policies:

**Policy 1: Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hooks');
```

**Policy 2: View**
```sql
CREATE POLICY "Anyone can view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hooks');
```

**Policy 3: Delete**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hooks' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## ✅ Pre-Launch Checklist

### Supabase Configuration
- [ ] Project created and active
- [ ] API keys copied to .env
- [ ] Database schema migrated
- [ ] Storage bucket created
- [ ] Storage policies configured
- [ ] RLS policies enabled on all tables

### Authentication
- [ ] Email provider enabled
- [ ] Can sign up new user
- [ ] Can log in
- [ ] Can log out
- [ ] Password reset works

### Core Features
- [ ] Can upload audio file
- [ ] Can browse hooks
- [ ] Can play audio
- [ ] Can view profile
- [ ] Can edit profile

### Stripe Integration (Before Launch)
- [ ] Stripe account created
- [ ] Test keys added to .env
- [ ] Webhook endpoint created
- [ ] Can complete test purchase
- [ ] License generated after purchase

### Edge Functions (Before Launch)
- [ ] All functions deployed to Supabase
- [ ] Secrets configured
- [ ] Webhook receiving events
- [ ] Email sending works

---

## 🧪 Test Your Connection

### Test 1: Database Connection
```javascript
// Run in browser console
const { data, error } = await supabase.from('hooks').select('*').limit(1);
console.log('Database test:', error ? 'FAILED' : 'SUCCESS', data);
```

### Test 2: Authentication
```javascript
// Run in browser console
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
});
console.log('Auth test:', error ? 'FAILED' : 'SUCCESS');
```

### Test 3: Storage
```javascript
// Run in browser console
const { data, error } = await supabase.storage.from('hooks').list();
console.log('Storage test:', error ? 'FAILED' : 'SUCCESS', data);
```

---

## 🔐 Security Checklist

Before launching to production:

- [ ] `.env` file is in `.gitignore`
- [ ] No secrets committed to git
- [ ] RLS policies enabled on ALL tables
- [ ] Storage policies configured correctly
- [ ] Service role key NEVER exposed to frontend
- [ ] Using HTTPS for production
- [ ] Email confirmation enabled (optional)

---

## 📝 Environment Variables Reference

### Development (.env)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

### Production (.env.production)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 🚀 Ready to Deploy?

Once all checklist items are complete:

1. **Review:** `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
2. **Set up Stripe:** `STRIPE_PAYMENT_INTEGRATION.md`
3. **Deploy Functions:** `DEPLOYMENT_GUIDE.md`
4. **Launch!** 🎉

---

## 🆘 Still Having Issues?

### Check Supabase Status
- Visit: [https://status.supabase.com](https://status.supabase.com)

### Review Logs
```bash
# Check Supabase logs
# Go to Dashboard → Logs → Select log type
```

### Common Solutions
1. **Clear browser cache** and reload
2. **Restart dev server** after .env changes
3. **Check Supabase project** is not paused
4. **Verify database migrations** ran successfully
5. **Review browser console** for specific errors

### Get Help
- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- HookDrop Docs: See other .md files in project root

---

## ✨ Connection Successful!

You should now be able to:
- ✅ Sign up and log in
- ✅ Upload hooks
- ✅ Browse marketplace
- ✅ View profiles
- ✅ All data persisting to Supabase

**Next Steps:**
1. Set up Stripe for payments
2. Deploy edge functions
3. Configure email service
4. Deploy to production

See `PRODUCTION_DEPLOYMENT_CHECKLIST.md` for complete launch guide.
