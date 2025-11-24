# RLS Policies Fixed - Hook Upload Issue Resolved

## Problem
Users were getting "new row violates row level security policy" error when trying to upload hooks.

## Solution Applied

### 1. Hooks Table INSERT Policy
Created an INSERT policy that allows authenticated users to insert hooks where their user_id matches:

```sql
CREATE POLICY "Users can insert their own hooks"
ON hooks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### 2. Storage Bucket Policies
Created comprehensive storage policies for the `hooks` bucket:

#### Upload Policy
```sql
CREATE POLICY "Users can upload hooks to their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hooks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### View Policy (Public)
```sql
CREATE POLICY "Public can view all hooks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hooks');
```

#### Update Policy
```sql
CREATE POLICY "Users can update their own hooks"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hooks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Delete Policy
```sql
CREATE POLICY "Users can delete their own hooks"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hooks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## File Upload Structure
Files should be uploaded with the path: `{user_id}/{filename}`

Example: `123e4567-e89b-12d3-a456-426614174000/my-hook.mp3`

## Testing
1. Log in as an authenticated user
2. Navigate to upload modal
3. Select an audio file
4. Upload should now succeed without RLS violations
5. The audio_url will be automatically generated as: `https://[project-ref].supabase.co/storage/v1/object/public/hooks/{user_id}/{filename}`

## All Active Policies

### Hooks Table
- INSERT: Users can insert their own hooks
- SELECT: Users can view public hooks and their own hooks
- UPDATE: Users can update their own hooks
- DELETE: Users can delete their own hooks

### Storage (hooks bucket)
- INSERT: Users can upload to their own folder
- SELECT: Public can view all files
- UPDATE: Users can update their own files
- DELETE: Users can delete their own files

## Next Steps
Try uploading a hook now - the RLS policies are properly configured!
