# Sample Hooks Upload Instructions

## Step 3: Upload Audio Files to Supabase Storage

### Using Supabase Dashboard:
1. Go to Storage in your Supabase dashboard
2. Open the "hooks" bucket
3. Create folders for organization (optional): `hip-hop/`, `trap/`, `edm/`, etc.
4. Upload your audio files
5. Copy the public URL for each file

### Using Supabase CLI (Batch Upload):
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Upload files
supabase storage upload hooks/hip-hop/hook1.mp3 ./path/to/hook1.mp3
```

## Step 4: Insert Hook Records into Database

Replace `YOUR_USER_ID_HERE` with Nathaniel Ryan's actual UUID from Step 1.

### Hip Hop Hooks (5 samples)
```sql
INSERT INTO hooks (seller_id, title, description, genre, bpm, key, price, audio_url, waveform_data, duration, created_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Boom Bap Classic', 'Old school hip hop beat with vinyl crackle', 'Hip Hop', 90, 'C Minor', 19.99, 'URL_FROM_STORAGE_1', '[]', 28, NOW()),
  ('YOUR_USER_ID_HERE', 'Street Flow', 'Modern trap-influenced hip hop hook', 'Hip Hop', 85, 'G Minor', 24.99, 'URL_FROM_STORAGE_2', '[]', 30, NOW()),
  ('YOUR_USER_ID_HERE', 'Golden Era', 'Nostalgic 90s hip hop vibe', 'Hip Hop', 92, 'D Minor', 19.99, 'URL_FROM_STORAGE_3', '[]', 27, NOW()),
  ('YOUR_USER_ID_HERE', 'Urban Groove', 'Smooth hip hop with jazz elements', 'Hip Hop', 88, 'F Major', 22.99, 'URL_FROM_STORAGE_4', '[]', 29, NOW()),
  ('YOUR_USER_ID_HERE', 'City Lights', 'Atmospheric hip hop instrumental', 'Hip Hop', 95, 'A Minor', 24.99, 'URL_FROM_STORAGE_5', '[]', 30, NOW());
```

### Trap Hooks (5 samples)
```sql
INSERT INTO hooks (seller_id, title, description, genre, bpm, key, price, audio_url, waveform_data, duration, created_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Hard 808s', 'Heavy trap beat with rolling hi-hats', 'Trap', 140, 'E Minor', 29.99, 'URL_FROM_STORAGE_6', '[]', 30, NOW()),
  ('YOUR_USER_ID_HERE', 'Trap Lord', 'Dark atmospheric trap instrumental', 'Trap', 145, 'C# Minor', 27.99, 'URL_FROM_STORAGE_7', '[]', 28, NOW()),
  ('YOUR_USER_ID_HERE', 'Bounce Back', 'Energetic trap with synth lead', 'Trap', 150, 'G Minor', 29.99, 'URL_FROM_STORAGE_8', '[]', 29, NOW()),
  ('YOUR_USER_ID_HERE', 'Midnight Run', 'Melodic trap with vocal chops', 'Trap', 138, 'D Minor', 24.99, 'URL_FROM_STORAGE_9', '[]', 30, NOW()),
  ('YOUR_USER_ID_HERE', 'Street Dreams', 'Emotional trap with piano', 'Trap', 142, 'A Minor', 26.99, 'URL_FROM_STORAGE_10', '[]', 27, NOW());
```

### EDM Hooks (5 samples)
```sql
INSERT INTO hooks (seller_id, title, description, genre, bpm, key, price, audio_url, waveform_data, duration, created_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Festival Drop', 'High-energy big room house hook', 'EDM', 128, 'C Major', 34.99, 'URL_FROM_STORAGE_11', '[]', 30, NOW()),
  ('YOUR_USER_ID_HERE', 'Neon Lights', 'Progressive house with uplifting melody', 'EDM', 126, 'G Major', 32.99, 'URL_FROM_STORAGE_12', '[]', 29, NOW()),
  ('YOUR_USER_ID_HERE', 'Electric Pulse', 'Future bass with vocal chops', 'EDM', 140, 'D Major', 29.99, 'URL_FROM_STORAGE_13', '[]', 28, NOW()),
  ('YOUR_USER_ID_HERE', 'Rave Energy', 'Hard-hitting electro house', 'EDM', 130, 'A Minor', 31.99, 'URL_FROM_STORAGE_14', '[]', 30, NOW()),
  ('YOUR_USER_ID_HERE', 'Sunrise', 'Melodic dubstep with emotional build', 'EDM', 140, 'F Major', 34.99, 'URL_FROM_STORAGE_15', '[]', 30, NOW());
```
