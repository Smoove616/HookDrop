# PostgREST Schema Cache Fix

## Problem
Getting error: "Could not find the table 'public.hooks' in the schema cache"

## What We've Done
1. ✅ Table exists in database (verified)
2. ✅ Permissions granted to anon/authenticated
3. ✅ RLS policies created
4. ✅ NOTIFY commands sent to PostgREST
5. ✅ Table completely recreated

## The Issue
This is a **PostgREST schema cache** problem. The table exists but PostgREST hasn't refreshed its cache.

## Solutions to Try (in order)

### 1. Wait and Hard Refresh
- Wait 3-5 minutes
- Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache completely

### 2. Test in Browser Console
```javascript
// This should now work:
await supabase.rpc('check_hooks_access')
// Should return: {table_exists: true, row_count: 0, can_select: true}
```

### 3. Restart PostgREST (Supabase Dashboard)
- Go to Supabase Dashboard
- Navigate to Settings → API
- Click "Restart API Server" or wait for auto-restart

### 4. Check API URL
Make sure you're using the correct Supabase URL in your app

### 5. Alternative: Use Different Table Name
If cache is completely stuck, we can rename to `hooks_v2`

## Current Status
- ✅ Database table: EXISTS
- ✅ Permissions: GRANTED
- ✅ RLS: ENABLED
- ⏳ PostgREST cache: REFRESHING

The table is ready - just waiting for PostgREST to recognize it.
