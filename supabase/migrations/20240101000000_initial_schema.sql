-- Create hooks table
CREATE TABLE IF NOT EXISTS hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  genre TEXT NOT NULL,
  bpm INTEGER,
  key TEXT,
  price DECIMAL(10,2) NOT NULL,
  audio_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_id UUID REFERENCES hooks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to hooks
CREATE POLICY "Allow public read access to hooks" ON hooks
  FOR SELECT USING (is_available = true);

-- Allow authenticated users to insert hooks
CREATE POLICY "Allow authenticated insert hooks" ON hooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow public read access to reviews
CREATE POLICY "Allow public read access to reviews" ON reviews
  FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hooks_genre ON hooks(genre);
CREATE INDEX IF NOT EXISTS idx_hooks_created_at ON hooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hooks_likes ON hooks(likes DESC);
CREATE INDEX IF NOT EXISTS idx_hooks_plays ON hooks(plays DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_hook_id ON reviews(hook_id);
