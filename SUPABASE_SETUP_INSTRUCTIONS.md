# HookDrop - Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: HookDrop (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait 2-3 minutes for setup

## Step 2: Get Your API Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
4. Copy both values

## Step 3: Update Your .env File

1. Open the `.env` file in your project root
2. Replace the placeholder values:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up Database Schema

1. In Supabase Dashboard, click **SQL Editor** (database icon)
2. Click **New Query**
3. Copy and paste the complete schema from below
4. Click **Run** to execute

### Complete Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Hooks table
CREATE TABLE IF NOT EXISTS hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  preview_url TEXT,
  waveform_data JSONB,
  genre TEXT,
  bpm INTEGER,
  key TEXT,
  duration INTEGER,
  price_non_exclusive DECIMAL(10,2),
  price_exclusive DECIMAL(10,2),
  license_types TEXT[],
  plays INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hooks are viewable by everyone"
  ON hooks FOR SELECT USING (true);

CREATE POLICY "Users can create their own hooks"
  ON hooks FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own hooks"
  ON hooks FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own hooks"
  ON hooks FOR DELETE USING (auth.uid() = seller_id);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id),
  hook_id UUID REFERENCES hooks(id),
  license_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  license_key TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT USING (auth.uid() = buyer_id);

-- Earnings table
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id),
  purchase_id UUID REFERENCES purchases(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own earnings"
  ON earnings FOR SELECT USING (auth.uid() = seller_id);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_id UUID REFERENCES hooks(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hooks_seller_id ON hooks(seller_id);
CREATE INDEX IF NOT EXISTS idx_hooks_created_at ON hooks(created_at);
CREATE INDEX IF NOT EXISTS idx_hooks_genre ON hooks(genre);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_hook_id ON purchases(hook_id);
CREATE INDEX IF NOT EXISTS idx_earnings_seller_id ON earnings(seller_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_subscription_tier ON user_preferences(subscription_tier);
```

## Step 5: Enable Storage for Audio Files

1. In Supabase Dashboard, click **Storage** (folder icon)
2. Click **Create a new bucket**
3. Name it: `hooks`
4. Set to **Public bucket** (so audio can be played)
5. Click **Create bucket**

### Set Storage Policies

Click on the `hooks` bucket, then **Policies**, then add:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload hooks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hooks');

-- Allow public to view/download
CREATE POLICY "Public can view hooks"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hooks');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own hooks"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hooks' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 6: Test the Connection

1. Save your `.env` file
2. Restart your development server: `npm run dev`
3. Open the app in your browser
4. Try signing up for an account
5. If successful, your Supabase is configured! 🎉

## Troubleshooting

**App still shows placeholder data?**
- Make sure you restarted the dev server after updating .env
- Check browser console for errors
- Verify the URL and key are copied correctly (no extra spaces)

**Can't sign up?**
- Check Email Auth is enabled in Supabase Dashboard > Authentication > Providers
- Verify RLS policies are created correctly

**Need help?**
- Check Supabase docs: https://supabase.com/docs
- Join Supabase Discord: https://discord.supabase.com
