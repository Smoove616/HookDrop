# Preview Generator Testing Guide

## Overview
Complete guide for testing the automated preview generator with FFmpeg WASM integration.

## Features Implemented
- ✅ Audio trimming (15-30 seconds)
- ✅ Beep watermarks every 5 seconds (1000Hz, 0.2s duration, 25% volume)
- ✅ Voice-like watermarks every 10 seconds (multi-tone synthesis, 15% volume)
- ✅ Bitrate reduction to 96kbps
- ✅ Custom start/end point selection
- ✅ Automatic upload to Supabase storage

## Testing Steps

### 1. Upload a Test Audio File
```bash
# Upload test audio to hooks bucket
curl -X POST https://YOUR_PROJECT.supabase.co/storage/v1/object/hooks/test-audio.mp3 \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -F "file=@/path/to/test-audio.mp3"
```

### 2. Generate Preview
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "audioUrl": "https://YOUR_PROJECT.supabase.co/storage/v1/object/public/hooks/test-audio.mp3",
    "startTime": 30,
    "endTime": 45,
    "hookId": "test-123"
  }'
```

### 3. Verify Output
Expected response:
```json
{
  "success": true,
  "previewUrl": "https://...previews/test-123_30_45.mp3",
  "startTime": 30,
  "endTime": 45,
  "duration": 15,
  "watermarked": true,
  "message": "Preview generated with beep watermarks and quality reduction"
}
```

## Watermark Verification

### Beep Watermarks
- **Frequency**: 1000Hz sine wave
- **Duration**: 0.2 seconds per beep
- **Interval**: Every 5 seconds
- **Volume**: 25% of original audio
- **Audibility**: Should be noticeable but not intrusive

### Voice Watermarks
- **Type**: Multi-tone synthesis (300Hz, 500Hz, 800Hz)
- **Duration**: 0.15 seconds
- **Interval**: Every 10 seconds
- **Volume**: 15% of original audio
- **Effect**: Sounds like a brief voice interruption

### Quality Reduction
- **Bitrate**: 96kbps (down from original)
- **Sample Rate**: 44.1kHz
- **Format**: MP3
- **Purpose**: Prevent high-quality unauthorized use

## Testing Checklist

- [ ] Audio is trimmed to exact start/end times
- [ ] Preview duration is between 15-30 seconds
- [ ] Beep watermarks are audible at 5s, 10s, 15s, etc.
- [ ] Voice watermarks are audible at 10s, 20s, etc.
- [ ] Audio quality is noticeably reduced
- [ ] File size is significantly smaller than original
- [ ] Preview uploads successfully to storage
- [ ] Public URL is accessible
- [ ] Original audio remains protected

## Performance Benchmarks

### Expected Processing Times
- 15s preview: ~5-10 seconds
- 30s preview: ~10-15 seconds
- Large files (>10MB): ~15-20 seconds

### File Size Reduction
- Original: ~1MB per minute at 320kbps
- Preview: ~0.72MB per minute at 96kbps
- Reduction: ~70% smaller

## Troubleshooting

### FFmpeg Not Loading
**Error**: "Failed to load FFmpeg"
**Solution**: Increase edge function timeout and memory limits

### Watermarks Too Loud
**Error**: Beeps overpower audio
**Solution**: Adjust amix weights in addBeepWatermarks (reduce from 0.25 to 0.15)

### Watermarks Too Quiet
**Error**: Can't hear watermarks
**Solution**: Increase amix weights (increase from 0.25 to 0.35)

### Processing Timeout
**Error**: Function times out
**Solution**: 
- Reduce preview duration
- Use smaller source files
- Consider async processing for large files

### Poor Audio Quality
**Error**: Audio sounds distorted
**Solution**: Increase bitrate from 96k to 128k

## Advanced Testing

### Test Different Audio Formats
```bash
# Test with WAV
curl -X POST ... -d '{"audioUrl": "...test.wav", ...}'

# Test with M4A
curl -X POST ... -d '{"audioUrl": "...test.m4a", ...}'
```

### Test Edge Cases
```bash
# Minimum duration (15s)
-d '{"startTime": 0, "endTime": 15, ...}'

# Maximum duration (30s)
-d '{"startTime": 0, "endTime": 30, ...}'

# Mid-track preview
-d '{"startTime": 60, "endTime": 75, ...}'
```

### Verify Watermark Timing
Use audio analysis tool:
```bash
ffmpeg -i preview.mp3 -af "astats" -f null -
```

## Integration Testing

### Test Full Upload Flow
1. Upload hook via UploadModal
2. Select preview start/end times
3. Generate preview
4. Verify preview plays in HookCard
5. Confirm original file remains private

### Test Multiple Previews
1. Generate preview with different start times
2. Verify each preview is unique
3. Check storage for multiple preview files
4. Confirm old previews are replaced (upsert: true)

## Security Verification

- [ ] Original files require authentication
- [ ] Preview files are publicly accessible
- [ ] Watermarks cannot be easily removed
- [ ] Quality reduction prevents professional use
- [ ] Rate limiting prevents abuse

## Next Steps

1. Monitor edge function logs for errors
2. Collect user feedback on watermark audibility
3. Adjust watermark parameters based on feedback
4. Consider adding custom voice recording for "HookDrop Preview"
5. Implement caching for frequently accessed previews
