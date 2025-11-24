# Playlist Collaboration System Setup

## Database Schema

Run these SQL queries in your Supabase SQL Editor:

```sql
-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  allow_collaboration BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create playlist_hooks junction table
CREATE TABLE IF NOT EXISTS playlist_hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  hook_id UUID NOT NULL REFERENCES hooks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_by UUID NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, hook_id)
);

-- Create playlist_collaborators table
CREATE TABLE IF NOT EXISTS playlist_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit', 'manage')),
  invited_by UUID NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, user_id)
);

-- Create playlist_activity table
CREATE TABLE IF NOT EXISTS playlist_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  hook_id UUID REFERENCES hooks(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_activity ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_playlist_hooks_playlist ON playlist_hooks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_playlist ON playlist_collaborators(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_activity_playlist ON playlist_activity(playlist_id);
```

## Permissions

- **view**: Can see playlist and hooks
- **edit**: Can add/remove hooks and reorder
- **manage**: Can edit + invite/remove collaborators + change settings

## Features Implemented

1. **Playlist Creation**: Create playlists with title, description, visibility
2. **Collaboration Invites**: Invite collaborators by email
3. **Permission Management**: Three permission levels (view, edit, manage)
4. **Drag-and-Drop Reordering**: Reorder hooks within playlists
5. **Share Links**: Generate unique shareable URLs
6. **Real-time Updates**: Collaborators see changes in real-time
7. **Activity Tracking**: Track all playlist modifications

## Edge Function

Deploy the `invite-playlist-collaborator` edge function to handle invitations.
