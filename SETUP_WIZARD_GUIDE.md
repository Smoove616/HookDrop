# HookDrop Setup Wizard Guide

## Overview
HookDrop now includes an automatic setup wizard that appears on first launch, making it easy to configure your Supabase connection without manually editing files.

## How It Works

### First Launch Experience
1. When you first open HookDrop, you'll see the Setup Wizard instead of the main app
2. The wizard guides you through entering your Supabase credentials
3. It tests the connection to ensure everything works
4. Once configured, the app loads normally

### Setup Steps

#### Step 1: Get Your Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to Project Settings > API
4. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

#### Step 2: Enter Credentials in Setup Wizard
1. Paste your Project URL into the first field
2. Paste your Anon Key into the second field
3. Click "Test Connection"
4. Wait for the connection test to complete

#### Step 3: Complete Setup
1. If the test succeeds, click "Complete Setup"
2. The app will reload with your configuration
3. You're ready to use HookDrop!

## Database Schema Setup

After completing the wizard, you need to set up your database tables. Follow the instructions in `DATABASE_SETUP.md` or `SUPABASE_SETUP_INSTRUCTIONS.md` to:

1. Create all required tables (profiles, hooks, purchases, etc.)
2. Set up Row Level Security policies
3. Create the storage bucket for audio files
4. Configure authentication settings

## Configuration Storage

Your Supabase credentials are stored securely in your browser's localStorage. This means:
- ✅ No need to edit .env files
- ✅ Configuration persists across sessions
- ✅ Easy to update if needed
- ⚠️ Clearing browser data will require re-setup

## Updating Configuration

To change your Supabase credentials:
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh the page
4. The setup wizard will appear again

## Troubleshooting

### "Connection Failed" Error
- Double-check your Project URL format (must start with https://)
- Verify your Anon Key is complete (they're very long!)
- Ensure your Supabase project is active
- Check that you copied the correct keys from the API settings

### Setup Wizard Doesn't Appear
- Clear your browser cache and localStorage
- Try in an incognito/private window
- Check browser console for errors

### App Still Shows Placeholder Data
- Make sure you've run the database schema setup
- Verify tables exist in your Supabase dashboard
- Check that RLS policies are configured correctly

## Technical Details

The setup wizard:
- Stores credentials in `localStorage` under `hookdrop_supabase_config`
- Tests connection by attempting to query the `profiles` table
- Falls back to .env variables if localStorage config doesn't exist
- Requires a page reload after configuration to reinitialize Supabase client

## Security Note

While the anon key is safe to expose in frontend code (it's designed for client-side use), never share your:
- Service role key
- Database password
- Project secrets

The setup wizard only uses the anon key, which has limited permissions controlled by Row Level Security.
