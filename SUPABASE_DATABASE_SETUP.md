# HookDrop - Complete Database Setup

## 🎯 Quick Setup (Copy & Paste)

Run these SQL commands in Supabase Dashboard → SQL Editor

---

## Step 1: Enable Extensions

```sql
-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for secure random generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## Step 2: Create Core Tables

### Profiles Table
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  stripe_account_id TEXT,
  stripe_account_status TEXT DEFAULT 'not_connected',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### User Preferences Table
```sql
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
  payout_schedule TEXT DEFAULT 'manual' CHECK (payout_schedule IN ('manual', 'weekly', 'monthly')),
  payout_threshold DECIMAL(10,2) DEFAULT 50.00,
  payout_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Hooks Table
```sql
CREATE TABLE IF NOT EXISTS hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  preview_url TEXT,
  waveform_data JSONB,
  cover_image_url TEXT,
  genre TEXT,
  bpm INTEGER,
  key TEXT,
  duration INTEGER,
  price_non_exclusive DECIMAL(10,2),
  price_exclusive DECIMAL(10,2),
  license_types TEXT[] DEFAULT ARRAY['non-exclusive', 'exclusive'],
  plays INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hooks viewable by everyone"
  ON hooks FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);

CREATE POLICY "Users can create own hooks"
  ON hooks FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own hooks"
  ON hooks FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own hooks"
  ON hooks FOR DELETE USING (auth.uid() = seller_id);
```

### Purchases Table
```sql
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hook_id UUID REFERENCES hooks(id) ON DELETE SET NULL,
  license_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  seller_earnings DECIMAL(10,2),
  license_key TEXT UNIQUE,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view their sales"
  ON purchases FOR SELECT USING (
    auth.uid() IN (SELECT seller_id FROM hooks WHERE id = hook_id)
  );
```

### Earnings Table
```sql
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'paid')),
  payout_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earnings"
  ON earnings FOR SELECT USING (auth.uid() = seller_id);
```

### Payouts Table
```sql
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  payout_type TEXT DEFAULT 'manual' CHECK (payout_type IN ('manual', 'automated')),
  stripe_payout_id TEXT,
  stripe_transfer_id TEXT,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts"
  ON payouts FOR SELECT USING (auth.uid() = seller_id);
```

### Reviews Table
```sql
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_id UUID REFERENCES hooks(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hook_id, reviewer_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for purchased hooks"
  ON reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM purchases 
      WHERE buyer_id = auth.uid() AND hook_id = reviews.hook_id
    )
  );

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);
```

---

## Step 3: Create Indexes for Performance

```sql
-- Hooks indexes
CREATE INDEX IF NOT EXISTS idx_hooks_seller_id ON hooks(seller_id);
CREATE INDEX IF NOT EXISTS idx_hooks_created_at ON hooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hooks_genre ON hooks(genre);
CREATE INDEX IF NOT EXISTS idx_hooks_status ON hooks(status);
CREATE INDEX IF NOT EXISTS idx_hooks_featured ON hooks(is_featured) WHERE is_featured = true;

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_hook_id ON purchases(hook_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session ON purchases(stripe_session_id);

-- Earnings indexes
CREATE INDEX IF NOT EXISTS idx_earnings_seller_id ON earnings(seller_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings(status);
CREATE INDEX IF NOT EXISTS idx_earnings_payout_id ON earnings(payout_id);

-- Payouts indexes
CREATE INDEX IF NOT EXISTS idx_payouts_seller_id ON payouts(seller_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at DESC);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_tier ON user_preferences(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_preferences_stripe_customer ON user_preferences(stripe_customer_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_hook_id ON reviews(hook_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
```

---

## Step 4: Create Helpful Functions

### Function to Update Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hooks_updated_at BEFORE UPDATE ON hooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Step 5: Verify Setup

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should see:
-- earnings
-- hooks
-- payouts
-- profiles
-- purchases
-- reviews
-- user_preferences
```

---

## ✅ Setup Complete!

Your database is now ready for HookDrop. Next steps:

1. **Set up Storage:** See `STORAGE_SETUP_GUIDE.md`
2. **Deploy Edge Functions:** See `DEPLOYMENT_GUIDE.md`
3. **Configure Stripe:** See `STRIPE_PAYMENT_INTEGRATION.md`

---

## 🔄 Optional: Seed Sample Data

```sql
-- Insert sample hooks (after you have a user)
-- Replace 'YOUR_USER_ID' with actual user ID from auth.users

INSERT INTO hooks (title, description, seller_id, audio_url, genre, bpm, price_non_exclusive, price_exclusive)
VALUES 
  ('Dark Trap Beat', 'Hard hitting trap hook', 'YOUR_USER_ID', 'https://example.com/audio1.mp3', 'Trap', 140, 29.99, 199.99),
  ('Melodic Pop Hook', 'Catchy pop melody', 'YOUR_USER_ID', 'https://example.com/audio2.mp3', 'Pop', 120, 39.99, 249.99);
```

See `SAMPLE_HOOKS_SETUP.md` for more sample data.
