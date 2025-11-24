# Automated Hook Preview Generation System

## System Overview

HookDrop's automated preview generation system creates watermarked 15-30 second audio snippets from full tracks, protecting sellers' intellectual property while allowing buyers to preview hooks before purchase.

## Features

### 1. Custom Preview Selection
- Sellers choose exact start/end times for previews
- Visual slider interface for precise selection
- Real-time preview playback before generation
- Automatic validation (15-30 second range)

### 2. Audio Processing (FFmpeg WASM)
- **Trimming**: Extracts selected segment from full track
- **Beep Watermarks**: 1000Hz tone every 5 seconds (0.2s, 25% volume)
- **Voice Watermarks**: Multi-tone synthesis every 10 seconds (15% volume)
- **Quality Reduction**: 96kbps bitrate (prevents professional use)
- **Format**: MP3 output with 44.1kHz sample rate

### 3. Storage & Protection
- Original files: Private bucket (authentication required)
- Preview files: Public bucket (watermarked, safe to share)
- Organized structure: `previews/{hookId}_{start}_{end}.mp3`
- Automatic upsert (replaces old previews)

## User Flow

### For Sellers

1. **Upload Hook**
   - Navigate to profile → Upload button
   - Fill in basic info (title, genre, price, etc.)
   - Upload audio file to Supabase storage

2. **Generate Preview**
   - System loads audio in preview generator
   - Adjust start/end sliders to select best segment
   - Click "Preview Selection" to test segment
   - Click "Generate" to create watermarked preview

3. **Preview Processing**
   - Edge function fetches original audio
   - FFmpeg trims to selected segment
   - Adds beep watermarks every 5 seconds
   - Adds voice-like watermarks every 10 seconds
   - Reduces bitrate to 96kbps
   - Uploads to storage and returns public URL

4. **Hook Published**
   - Preview URL saved to database
   - Hook appears in marketplace
   - Buyers hear preview, not original

### For Buyers

1. **Browse Marketplace**
   - See hook cards with play buttons
   - Click play → hears watermarked preview
   - Cannot access original file

2. **Purchase Hook**
   - After payment, gains access to original
   - Downloads full-quality, unwatermarked file
   - License agreement recorded

## Technical Architecture

### Components

**PreviewGenerator.tsx**
- React component with audio controls
- Dual sliders for start/end time selection
- Preview playback functionality
- Calls generate-preview edge function

**generate-preview Edge Function**
- Fetches audio from storage
- Processes with FFmpeg WASM
- Uploads watermarked preview
- Returns public URL

**HookCard.tsx**
- Displays hook in marketplace
- Plays preview_url if available
- Falls back to original for owners

### Database Schema

```sql
ALTER TABLE hooks ADD COLUMN preview_url TEXT;
ALTER TABLE hooks ADD COLUMN preview_start_time FLOAT;
ALTER TABLE hooks ADD COLUMN preview_end_time FLOAT;
ALTER TABLE hooks ADD COLUMN preview_generated BOOLEAN DEFAULT false;
```

### Storage Buckets

**hooks bucket (public)**
- Original uploads: `{userId}/{filename}`
- Previews: `previews/{hookId}_{start}_{end}.mp3`

## Watermark Details

### Beep Watermarks
- **Purpose**: Audible protection, hard to remove
- **Frequency**: 1000Hz sine wave
- **Timing**: Every 5 seconds
- **Duration**: 0.2 seconds per beep
- **Volume**: 25% of original audio
- **Implementation**: FFmpeg filter_complex with sine generator

### Voice Watermarks
- **Purpose**: Additional layer of protection
- **Type**: Multi-tone synthesis (300Hz, 500Hz, 800Hz)
- **Timing**: Every 10 seconds
- **Duration**: 0.15 seconds
- **Volume**: 15% of original audio
- **Effect**: Brief interruption simulating voice

### Quality Reduction
- **Bitrate**: 96kbps (vs typical 320kbps)
- **Effect**: ~70% file size reduction
- **Purpose**: Prevents professional use while maintaining listenability
- **Sample Rate**: 44.1kHz (standard)

## Security Model

### Protection Layers

1. **Storage Access Control**
   - Original files require authentication
   - Only owner/purchasers can access
   - Previews are public but watermarked

2. **Watermark Protection**
   - Multiple watermark types (hard to remove all)
   - Random-ish timing (prevents pattern matching)
   - Quality reduction (limits usability)

3. **Database Tracking**
   - All purchases recorded
   - License agreements logged
   - Unauthorized use traceable

## Performance

### Processing Times
- 15s preview: ~5-10 seconds
- 30s preview: ~10-15 seconds
- Depends on: file size, server load, FFmpeg initialization

### File Sizes
- Original: ~1MB per minute @ 320kbps
- Preview: ~0.72MB per minute @ 96kbps
- Reduction: ~70% smaller

### Optimization
- FFmpeg WASM loads on-demand
- Previews cached in storage
- CDN delivery for fast playback
- Upsert prevents duplicate files

## Customization

See `WATERMARK_CUSTOMIZATION_GUIDE.md` for:
- Adjusting watermark frequency/volume
- Adding real voice recordings
- Changing quality settings
- Creating preset configurations

## Testing

See `PREVIEW_GENERATOR_TESTING.md` for:
- Complete testing procedures
- Verification checklists
- Troubleshooting guide
- Performance benchmarks

## Future Enhancements

1. **Async Processing**: Background jobs for large files
2. **Real Voice Recording**: Professional "HookDrop Preview" audio
3. **Waveform Visualization**: Visual representation in player
4. **Batch Processing**: Generate previews for multiple hooks
5. **A/B Testing**: Different watermark configurations
6. **Analytics**: Track preview plays vs purchases
