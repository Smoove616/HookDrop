# Sample Hooks Setup Guide

## Overview
This guide helps populate the HookDrop database with sample hooks across multiple genres, all owned by Nathaniel Ryan.

## Step 1: Get Your User ID

First, you need to get Nathaniel Ryan's user ID from Supabase:

```sql
-- Run this after signing up as Nathaniel Ryan
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

Save this UUID - you'll need it for Step 3.

## Step 2: Download Sample Audio Files

### Recommended Sources (Royalty-Free):
1. **Pixabay Music** (https://pixabay.com/music/)
   - Free, no attribution required
   - Filter by genre and duration (0-30 seconds)

2. **FreeMusicArchive** (https://freemusicarchive.org/)
   - Creative Commons licensed
   - Various genres available

3. **Incompetech** (https://incompetech.com/)
   - Royalty-free music by Kevin MacLeod
   - Attribution required

### Download 5-10 tracks for each genre:
- Hip Hop
- Trap
- EDM
- Rock
- Pop
- R&B
- Lo-Fi
- Jazz
- Country
- Electronic

**Important**: Trim each file to 30 seconds or less using audio editing software.


## Step 3: Setup Stripe Connect Account

To receive payments, you need to set up a Stripe Connect account for Nathaniel Ryan:

1. Log in to HookDrop as Nathaniel Ryan
2. Go to Profile page
3. Click "Setup Payout Account" button
4. Complete the Stripe Connect onboarding process
5. This will create a `stripe_account_id` in your user record

## Important Notes

1. **Audio Files Required**: The SQL inserts reference `URL_FROM_STORAGE_X` placeholders. You MUST:
   - Download actual audio files (30 seconds or less)
   - Upload them to Supabase Storage (hooks bucket)
   - Replace the placeholders with real storage URLs

2. **Ownership**: All hooks will be owned by Nathaniel Ryan's user account

3. **Earnings**: When these hooks are purchased, 90% of revenue goes to the seller (Nathaniel Ryan), 10% to platform

4. **Waveform Data**: Currently set to empty array `[]`. The app will generate waveforms when the audio is played

5. **Licensing**: All sample audio must be royalty-free or properly licensed for commercial use

## Next Steps

After completing this setup:
1. Upload audio files to Supabase Storage
2. Run SQL INSERT statements from SAMPLE_HOOKS_UPLOAD.md
3. Run additional SQL INSERT statements from SAMPLE_HOOKS_PART2.md
4. Test purchasing a hook to ensure payment flow works
5. Verify earnings are tracked correctly

See **SAMPLE_HOOKS_UPLOAD.md** and **SAMPLE_HOOKS_PART2.md** for the complete SQL INSERT statements for all 50 hooks across 10 genres.
