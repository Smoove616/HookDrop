-- Seed Hooks Data
-- Replace the sample data below with your actual hooks

INSERT INTO hooks (title, seller_name, genre, bpm, key, price, audio_url, likes, plays) VALUES
  ('Sample Hook 1', 'Producer Name', 'Hip Hop', 140, 'C Minor', 29.99, 'https://example.com/hook1.mp3', 0, 0),
  ('Sample Hook 2', 'Producer Name', 'R&B', 85, 'G Major', 39.99, 'https://example.com/hook2.mp3', 0, 0);

-- Add more hooks here following the same format:
-- ('Title', 'Seller Name', 'Genre', BPM, 'Key', Price, 'Audio URL', Likes, Plays),

-- To run this migration:
-- 1. Replace sample data with your actual hooks
-- 2. Run: supabase db push
-- Or manually run this SQL in your Supabase SQL Editor
