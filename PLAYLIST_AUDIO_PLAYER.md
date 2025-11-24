# Playlist Audio Player Features

## Overview
The HookDrop platform now includes a comprehensive playlist audio player system that allows users to play all hooks in a playlist sequentially with advanced playback controls.

## Features

### 1. Sequential Playback
- Play all hooks in a playlist in order
- Automatic progression to the next hook when one finishes
- Click "Play All" button in any playlist to start playback

### 2. Playback Controls
- **Play/Pause**: Toggle playback of the current hook
- **Skip Forward**: Jump to the next hook in the playlist
- **Skip Backward**: Return to the previous hook
- **Progress Bar**: Visual indicator of playback progress with click-to-seek functionality
- **Time Display**: Shows current time and total duration

### 3. Shuffle Mode
- Randomize playback order
- Tracks play history to avoid repeating hooks until all have been played
- Visual indicator when shuffle is active (purple highlight)

### 4. Repeat Modes
- **Off**: Playlist stops after the last hook
- **Repeat All**: Playlist loops continuously
- **Repeat One**: Current hook repeats indefinitely
- Click the repeat button to cycle through modes

### 5. Mini Player
- Persistent player bar at the bottom of all pages
- Displays currently playing hook with album art
- Full playback controls always accessible
- Volume slider for audio control
- Playlist viewer showing all queued hooks

### 6. Keyboard Shortcuts
- **Spacebar**: Play/Pause toggle
- **Right Arrow**: Skip to next hook
- **Left Arrow**: Skip to previous hook
- Shortcuts work globally except when typing in input fields

### 7. Playlist Queue Management
- View all hooks in the current playlist
- Remove hooks from the queue
- Click any hook in the queue to jump to it
- Visual indicator for currently playing hook

## Usage

### Playing a Playlist
1. Navigate to any playlist in your profile or discover page
2. Click the "Play All" button in the playlist header
3. The mini player will appear at the bottom with playback controls

### Using Shuffle and Repeat
1. Click the shuffle icon to randomize playback order
2. Click the repeat icon to cycle through repeat modes:
   - No icon highlight = Off
   - Circular arrow = Repeat All
   - Circular arrow with "1" = Repeat One

### Managing the Queue
1. Click the playlist icon (with number) in the mini player
2. A sidebar will open showing all queued hooks
3. Click any hook to jump to it
4. Click the X button to remove a hook from the queue

### Keyboard Controls
- Press **Space** to pause/resume playback
- Press **Right Arrow** to skip forward
- Press **Left Arrow** to go back
- These work on any page (except when typing)

## Technical Implementation

### AudioContext
The audio player is powered by a React Context (`AudioContext`) that manages:
- Current playback state
- Playlist queue
- Shuffle and repeat modes
- Playback history for shuffle mode
- Audio element control

### Real-time Integration
The player integrates with the playlist collaboration system:
- When collaborators add/remove hooks, the playlist updates in real-time
- Changes are reflected in the queue immediately
- Optimistic updates ensure smooth user experience

### Persistence
The mini player persists across all pages in the application, allowing users to:
- Browse other content while listening
- Navigate between pages without interrupting playback
- Access controls from anywhere in the app

## Future Enhancements
- Crossfade between tracks
- Equalizer settings
- Playback speed control
- Lyrics display
- Queue reordering via drag-and-drop
- Save queue as new playlist
- Download playlist for offline playback
