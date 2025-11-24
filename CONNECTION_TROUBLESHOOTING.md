# HookDrop - Connection Troubleshooting Guide

## 🔧 Fixing Supabase Connection Issues

This guide helps you diagnose and fix connection problems.

---

## Quick Diagnosis

### Check 1: Environment Variables
```bash
# In your terminal, from project root:
cat .env

# You should see:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**Problems:**
- ❌ File doesn't exist → Create `.env` file
- ❌ Values are placeholders → Add real values from Supabase
- ❌ Extra spaces or quotes → Remove them
- ❌ Wrong file name (`.env.txt`) → Rename to `.env`

### Check 2: Browser Console
1. Open app in browser
2. Press F12 to open DevTools
3. Click "Console" tab
4. Look for errors

**Common Errors:**

**"Supabase not configured"**
```
Fix: Update .env file and restart server
```

**"Failed to fetch"**
```
Fix: Check Supabase project is active, verify URL
```

**"Invalid API key"**
```
Fix: Verify you copied the anon key (not service_role)
```

### Check 3: Supabase Project Status
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Find your project
3. Check status indicator

**Status Issues:**
- 🔴 Paused → Click "Resume project"
- 🟡 Upgrading → Wait for completion
- ⚪ Inactive → Project may be deleted

---

## Issue: "Supabase not configured" Warning

### Symptoms
- Warning in browser console
- App shows placeholder data
- Can't sign up or log in

### Solution Steps

**Step 1: Verify .env file exists**
```bash
# Check if file exists
ls -la .env

# If not found, create it:
touch .env
```

**Step 2: Add correct values**
```bash
# Open .env and add:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

**Step 3: Get values from Supabase**
1. Go to Supabase Dashboard
2. Click your project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

**Step 4: Restart dev server**
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

**Step 5: Clear browser cache**
1. Open DevTools (F12)
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"

---

## Issue: "Invalid API Key" Error

### Symptoms
- Error when trying to sign up
- 401 Unauthorized errors
- "Invalid JWT" messages

### Solution Steps

**Step 1: Verify correct key**
1. Go to Supabase Dashboard → Settings → API
2. Make sure you copied **anon public** key
3. NOT the service_role key

**Step 2: Check for formatting issues**
```bash
# Key should:
✅ Start with: eyJhbGci
✅ Be one long string
✅ Have no spaces
✅ Have no line breaks
✅ Have no quotes around it

# Bad examples:
❌ VITE_SUPABASE_ANON_KEY="eyJhbGci..."  (has quotes)
❌ VITE_SUPABASE_ANON_KEY=eyJhbGci
   ...continues on next line  (line break)
```

**Step 3: Regenerate key if needed**
1. In Supabase Dashboard → Settings → API
2. Scroll to "Project API keys"
3. Click "Reset" next to anon key (if needed)
4. Copy new key to .env
5. Restart server

---

## Issue: "Failed to fetch" or CORS Error

### Symptoms
- Network errors in console
- "CORS policy" errors
- Can't connect to Supabase

### Solution Steps

**Step 1: Check Supabase project status**
1. Go to Supabase Dashboard
2. Verify project is not paused
3. Click "Resume" if paused

**Step 2: Verify URL format**
```bash
# Correct format:
✅ https://abcdefghijk.supabase.co

# Wrong formats:
❌ https://abcdefghijk.supabase.co/  (trailing slash)
❌ http://abcdefghijk.supabase.co   (http not https)
❌ abcdefghijk.supabase.co          (missing https://)
```

**Step 3: Check internet connection**
```bash
# Test if you can reach Supabase
curl https://your-project-id.supabase.co

# Should return HTML, not error
```

**Step 4: Check firewall/VPN**
- Disable VPN temporarily
- Check corporate firewall settings
- Try different network

---

## Issue: Can't Sign Up / Authentication Error

### Symptoms
- Sign up button doesn't work
- "User already exists" for new email
- No user created in database

### Solution Steps

**Step 1: Enable Email auth**
1. Supabase Dashboard → Authentication → Providers
2. Find "Email" provider
3. Toggle it ON if disabled
4. Save changes

**Step 2: Check email settings**
1. Authentication → Providers → Email
2. Verify "Enable Email Signup" is ON
3. Check "Confirm email" setting (can disable for testing)

**Step 3: Verify database schema**
```sql
-- In SQL Editor, run:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should see: profiles, hooks, purchases, etc.
-- If not, run migration from:
-- supabase/migrations/20240101000000_initial_schema.sql
```

**Step 4: Check RLS policies**
```sql
-- Verify policies exist:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Should see policies for each table
```

**Step 5: Test with SQL**
```sql
-- Try creating user manually:
INSERT INTO auth.users (email, encrypted_password)
VALUES ('test@example.com', crypt('password123', gen_salt('bf')));

-- If this fails, check error message
```

---

## Issue: Database Connection Failed

### Symptoms
- Can't query database
- "relation does not exist" errors
- Tables not found

### Solution Steps

**Step 1: Verify migration ran**
1. Supabase Dashboard → SQL Editor
2. Run: `SELECT * FROM profiles LIMIT 1;`
3. If error "relation does not exist" → Migration not run

**Step 2: Run migration**
1. SQL Editor → New Query
2. Copy from: `supabase/migrations/20240101000000_initial_schema.sql`
3. Paste and click Run
4. Wait for "Success" message

**Step 3: Check for errors**
```sql
-- Check if tables exist:
\dt

-- Or:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Step 4: Verify RLS is enabled**
```sql
-- Check RLS status:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- rowsecurity should be 't' (true)
```

---

## Issue: Storage/Upload Not Working

### Symptoms
- Can't upload files
- "Bucket not found" error
- "Permission denied" on upload

### Solution Steps

**Step 1: Create bucket**
1. Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name: `hooks`
4. Make it Public
5. Click Create

**Step 2: Set policies**
```sql
-- In SQL Editor, run:

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload hooks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hooks');

-- Allow public to view
CREATE POLICY "Public can view hooks"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hooks');

-- Allow users to delete own files
CREATE POLICY "Users can delete own hooks"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hooks');
```

**Step 3: Verify bucket is public**
1. Storage → Click `hooks` bucket
2. Check "Public bucket" is enabled
3. If not, click settings and enable

---

## Issue: Dev Server Won't Start

### Symptoms
- `npm run dev` fails
- Port already in use
- Module not found errors

### Solution Steps

**Step 1: Check port availability**
```bash
# Check if port 5173 is in use
lsof -i :5173

# Kill process if found
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

**Step 2: Reinstall dependencies**
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Step 3: Check Node version**
```bash
# Check version
node --version

# Should be 18.x or higher
# If not, update Node.js
```

**Step 4: Clear cache**
```bash
# Clear npm cache
npm cache clean --force

# Clear Vite cache
rm -rf node_modules/.vite
```

---

## Testing Your Connection

### Test 1: Basic Connection
```javascript
// Open browser console (F12) and run:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Should show your URL and true
```

### Test 2: Database Query
```javascript
// In browser console:
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Query test:', error ? 'FAILED' : 'SUCCESS', data);
```

### Test 3: Authentication
```javascript
// In browser console:
const { data, error } = await supabase.auth.getSession();
console.log('Auth test:', error ? 'FAILED' : 'SUCCESS');
```

### Test 4: Storage
```javascript
// In browser console:
const { data, error } = await supabase.storage.from('hooks').list();
console.log('Storage test:', error ? 'FAILED' : 'SUCCESS');
```

---

## Still Having Issues?

### Collect Debug Info

```bash
# 1. Check environment
echo "Node version:" && node --version
echo "npm version:" && npm --version
echo "Environment file:" && cat .env

# 2. Check Supabase config
# In browser console:
console.log('Config:', {
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  mode: import.meta.env.MODE
});

# 3. Check network
curl -I https://your-project-id.supabase.co
```

### Get Help

**Supabase Support:**
- Docs: [supabase.com/docs](https://supabase.com/docs)
- Discord: [discord.supabase.com](https://discord.supabase.com)
- Status: [status.supabase.com](https://status.supabase.com)

**Project Documentation:**
- `SUPABASE_CONNECTION_GUIDE.md` - Full setup guide
- `QUICK_START_GUIDE.md` - Quick setup
- `LAUNCH_READINESS_CHECKLIST.md` - Pre-launch checks

---

## Prevention Tips

✅ Always restart server after .env changes  
✅ Keep .env in .gitignore  
✅ Use test keys in development  
✅ Regularly check Supabase status  
✅ Keep dependencies updated  
✅ Back up your database regularly  
✅ Document your setup steps  

---

## Success Indicators

You'll know connection is working when:

✅ No errors in browser console  
✅ Can sign up new account  
✅ Can log in and out  
✅ Can query database  
✅ Can upload files  
✅ App shows real data (not placeholders)  

**Connection successful? Great! See `LAUNCH_READINESS_CHECKLIST.md` for next steps.**
