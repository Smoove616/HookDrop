# Adding Hooks to HookDrop

## Method 1: SQL Migration (Recommended)

1. **Edit the seed file**: `supabase/migrations/20240102000000_seed_hooks.sql`

2. **Add your hooks** in this format:
```sql
INSERT INTO hooks (title, seller_name, genre, bpm, key, price, audio_url, likes, plays) VALUES
  ('Melodic Trap Hook', 'DJ Producer', 'Trap', 140, 'C Minor', 29.99, 'https://your-storage.com/hook1.mp3', 0, 0),
  ('Smooth R&B Vocal', 'VocalKing', 'R&B', 85, 'G Major', 39.99, 'https://your-storage.com/hook2.mp3', 0, 0);
```

3. **Run migration**:
```bash
supabase db push
```

## Method 2: Supabase Dashboard

1. Go to your Supabase project
2. Click **SQL Editor**
3. Paste your INSERT statements
4. Click **Run**

## Method 3: Bulk Import CSV

1. Prepare CSV with columns: `title,seller_name,genre,bpm,key,price,audio_url`
2. Go to **Table Editor** > **hooks** table
3. Click **Insert** > **Import from CSV**

## Hook Data Format

| Field | Type | Required | Example |
|-------|------|----------|---------|
| title | text | Yes | "Melodic Trap Hook" |
| seller_name | text | Yes | "DJ Producer" |
| genre | text | Yes | "Hip Hop" |
| bpm | integer | No | 140 |
| key | text | No | "C Minor" |
| price | decimal | Yes | 29.99 |
| audio_url | text | Yes | "https://..." |

## Supported Genres
Hip Hop, Trap, R&B, Pop, Drill, Afrobeat, Reggaeton, Electronic, Rock, Country

**Ready to add your hooks! Just provide the data in any format and I'll help format it.**
