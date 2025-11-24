# Audio Processing Setup for Preview Generator

## Overview
The preview generator creates 15-30 second watermarked audio snippets from full tracks. This guide explains how to integrate actual audio processing.

## Current Implementation
The edge function currently has placeholder functions for audio processing. To enable full functionality, integrate one of the following solutions:

## Option 1: FFmpeg WASM (Recommended for Edge Functions)
```typescript
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.6';

async function processAudioPreview(audioBuffer, startTime, endTime) {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();
  
  // Write input file
  await ffmpeg.writeFile('input.mp3', new Uint8Array(audioBuffer));
  
  // Trim audio and reduce quality
  await ffmpeg.exec([
    '-i', 'input.mp3',
    '-ss', startTime.toString(),
    '-t', (endTime - startTime).toString(),
    '-b:a', '96k',
    '-ar', '44100',
    'output.mp3'
  ]);
  
  // Read output
  const data = await ffmpeg.readFile('output.mp3');
  return new Blob([data.buffer], { type: 'audio/mpeg' });
}
```

## Option 2: Cloudinary Audio Transformation
```typescript
// Set CLOUDINARY_URL environment variable
const cloudinaryUrl = Deno.env.get('CLOUDINARY_URL');

async function processWithCloudinary(audioUrl, startTime, endTime) {
  const response = await fetch(`${cloudinaryUrl}/video/upload`, {
    method: 'POST',
    body: JSON.stringify({
      file: audioUrl,
      resource_type: 'video',
      start_offset: startTime,
      end_offset: endTime,
      audio_codec: 'mp3',
      bit_rate: '96k'
    })
  });
  return response.json();
}
```

## Option 3: External Media Processing API
Use services like:
- AWS MediaConvert
- Google Cloud Speech-to-Text + Audio Processing
- Mux.com
- Transloadit

## Watermark Implementation

### Beep Tone Watermark
```typescript
// Generate beep tone every 5 seconds
async function addBeepWatermark(ffmpeg, duration) {
  const beepFilter = [];
  for (let i = 5; i < duration; i += 5) {
    beepFilter.push(`sine=frequency=1000:duration=0.2:sample_rate=44100[beep${i}]`);
  }
  
  await ffmpeg.exec([
    '-i', 'input.mp3',
    '-filter_complex', beepFilter.join(';'),
    'output.mp3'
  ]);
}
```

### Voice Overlay Watermark
```typescript
// Add "HookDrop Preview" voice overlay
async function addVoiceWatermark(ffmpeg) {
  await ffmpeg.exec([
    '-i', 'input.mp3',
    '-i', 'watermark_voice.mp3',
    '-filter_complex', '[0:a][1:a]amerge=inputs=2[a]',
    '-map', '[a]',
    'output.mp3'
  ]);
}
```

## Quality Reduction Settings
- Bitrate: 96-128 kbps (down from 320 kbps)
- Sample Rate: 44.1 kHz
- Channels: Stereo or Mono
- Format: MP3

## Setup Instructions

1. **Install FFmpeg WASM** (if using Option 1):
   - Already included in edge function imports
   - No additional setup needed

2. **Configure Cloudinary** (if using Option 2):
   - Sign up at cloudinary.com
   - Add CLOUDINARY_URL to Supabase secrets
   - Update edge function to use Cloudinary API

3. **Update Edge Function**:
   - Replace placeholder functions with actual implementation
   - Test with sample audio files
   - Verify watermarks are audible but not intrusive

## Testing
```bash
# Test preview generation
curl -X POST https://your-project.supabase.co/functions/v1/generate-preview \
  -H "Content-Type: application/json" \
  -d '{
    "audioUrl": "https://storage.url/audio.mp3",
    "startTime": 30,
    "endTime": 45,
    "hookId": "123"
  }'
```

## Performance Considerations
- Edge function timeout: 60 seconds
- Max file size: 50MB
- Processing time: 5-15 seconds typical
- Consider async processing for large files

## Security
- Previews stored in separate storage bucket
- Original files remain protected
- Preview URLs are public but watermarked
- Rate limiting recommended
