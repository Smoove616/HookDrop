# Hooks Table RLS Troubleshooting Guide

## Issue: "New row violates row level security" Error

This error occurs when trying to insert hooks into the database. The issue has been resolved with the following fixes:

## ✅ Fixed Issues

### 1. Missing Columns Added
The following columns were missing from the `hooks` table and have been added:
- `license_type` (TEXT) - Type of license: 'both', 'exclusive', or 'non_exclusive'
- `non_exclusive_price` (DECIMAL) - Price for non-exclusive license
- `exclusive_price` (DECIMAL) - Price for exclusive license
- `license_terms` (TEXT) - Custom license terms
- `preview_url` (TEXT) - URL to preview audio clip
- `preview_start` (INTEGER) - Start time of preview in seconds
- `preview_duration` (INTEGER) - Duration of preview in seconds
- `lyrics` (JSONB) - Array of lyric lines with timestamps

### 2. Complete RLS Policies

The following RLS policies are now active on the `hooks` table:

#### INSERT Policy
```sql
CREATE POLICY "Allow authenticated insert hooks" ON hooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```
- Allows authenticated users to insert hooks
- Ensures user_id matches the authenticated user

#### SELECT Policy
```sql
CREATE POLICY "Allow public and own hooks read" ON hooks
  FOR SELECT USING (is_available = true OR auth.uid() = user_id);
```
- Public users can view hooks where `is_available = true`
- Users can always view their own hooks, even if not available

#### UPDATE Policy
```sql
CREATE POLICY "Allow users to update own hooks" ON hooks
  FOR UPDATE USING (auth.uid() = user_id);
```
- Users can only update their own hooks

#### DELETE Policy
```sql
CREATE POLICY "Allow users to delete own hooks" ON hooks
  FOR DELETE USING (auth.uid() = user_id);
```
- Users can only delete their own hooks

## Testing the Upload

1. **Ensure you're logged in**: The upload requires authentication
2. **Fill in all required fields**: title, genre, bpm, price, audio file
3. **Check user_id**: The system automatically sets user_id from auth.uid()
4. **Verify file upload**: Audio file must be uploaded to storage first

## Common Issues

### "User not authenticated"
- Make sure you're logged in before uploading
- Check that the AuthContext is providing the user object

### "Column does not exist"
- The schema has been updated with all required columns
- If you still see this error, refresh your database connection

### "Invalid input syntax"
- Ensure BPM is a valid integer
- Ensure prices are valid decimal numbers
- Check that genre is not empty

## Upload Flow

1. **Step 1**: Fill in hook details and upload audio file
2. **Step 2**: Generate preview clip (optional)
3. **Finish**: Insert hook into database with all metadata

The upload should now work without RLS errors!
