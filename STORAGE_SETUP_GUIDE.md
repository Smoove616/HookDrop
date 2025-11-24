# Storage Bucket Setup Guide for Hook Audio Files

## Overview
The HookDrop application uses Supabase Storage to store audio files for hooks. The upload interface is already implemented in the UploadModal component.

## Storage Bucket Configuration

### Bucket Details
- **Name**: `hooks`
- **Public Access**: Yes (already created)
- **Purpose**: Store audio files uploaded by producers

### Required RLS Policies

You need to set up Row Level Security policies in the Supabase Dashboard:

1. Go to **Storage** → **Policies** in your Supabase Dashboard
2. Select the `hooks` bucket
3. Add the following policies:

#### Policy 1: Users Can Upload Hooks
- **Operation**: INSERT
- **Policy Name**: Users can upload hooks
- **Target Roles**: authenticated
- **Policy Definition**:
```sql
bucket_id = 'hooks' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 2: Anyone Can View Hooks
- **Operation**: SELECT
- **Policy Name**: Anyone can view hooks
- **Target Roles**: public
- **Policy Definition**:
```sql
bucket_id = 'hooks'
```

#### Policy 3: Users Can Update Own Hooks
- **Operation**: UPDATE
- **Policy Name**: Users can update own hooks
- **Target Roles**: authenticated
- **Policy Definition**:
```sql
bucket_id = 'hooks' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 4: Users Can Delete Own Hooks
- **Operation**: DELETE
- **Policy Name**: Users can delete own hooks
- **Target Roles**: authenticated
- **Policy Definition**:
```sql
bucket_id = 'hooks' AND (storage.foldername(name))[1] = auth.uid()::text
```

## How the Upload Works

### File Upload Flow
1. User selects audio file in UploadModalStep1
2. User fills in hook details (title, genre, key, BPM, pricing)
3. User clicks "Next" → triggers `handleNext()` in UploadModal
4. File is uploaded to: `hooks/{user_id}/{timestamp}.{extension}`
5. Public URL is generated and stored in `audio_url` field
6. User proceeds to Step 2 to generate preview
7. Hook record is created in database with audio_url

### File Naming Convention
Files are stored as: `{user_id}/{timestamp}.{file_extension}`

Example: `550e8400-e29b-41d4-a716-446655440000/1699564800000.mp3`

### Supported Audio Formats
- MP3
- WAV
- M4A
- OGG
- FLAC

## Testing the Upload

1. Log in as an authenticated user
2. Click "Upload Hook" button
3. Select an audio file
4. Fill in all required fields
5. Click "Next" to upload
6. Verify file appears in Storage bucket
7. Complete preview generation
8. Verify `audio_url` is saved in hooks table

## Troubleshooting

### Upload Fails with "Permission Denied"
- Verify RLS policies are correctly set up
- Check that user is authenticated
- Ensure bucket is public for read access

### File Not Appearing
- Check browser console for errors
- Verify file size is within limits
- Check file format is supported

### Public URL Not Working
- Ensure bucket is set to public
- Verify RLS SELECT policy allows public access
- Check CORS settings if accessing from different domain
