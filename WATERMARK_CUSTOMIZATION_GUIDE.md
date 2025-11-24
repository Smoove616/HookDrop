# Watermark Customization Guide

## Overview
Guide for customizing audio watermarks in the preview generator system.

## Watermark Types

### 1. Beep Tone Watermarks
**Current Settings:**
- Frequency: 1000Hz
- Duration: 0.2 seconds
- Interval: Every 5 seconds
- Volume: 25% (0.25 weight)

**Customization Options:**

#### Change Frequency
```typescript
// In addBeepWatermarks function
sine=frequency=1000  // Change to 800-1200Hz
```

#### Change Duration
```typescript
duration=0.2  // Change to 0.1-0.5 seconds
```

#### Change Interval
```typescript
for (let i = 5; i < duration; i += 5)  // Change 5 to 3-10 seconds
```

#### Change Volume
```typescript
weights=1 ${beepTimes.map(() => '0.25')}  // Change 0.25 to 0.1-0.5
```

### 2. Voice-Like Watermarks
**Current Settings:**
- Frequencies: 300Hz, 500Hz, 800Hz (simulates speech)
- Duration: 0.15 seconds
- Interval: Every 10 seconds
- Volume: 15% (0.15 weight)

**Customization Options:**

#### Add Real Voice Recording
```typescript
// Upload voice file to storage
const voiceUrl = 'https://storage/hookdrop-preview-voice.mp3';
const voiceResponse = await fetch(voiceUrl);
const voiceBuffer = await voiceResponse.arrayBuffer();
await ffmpeg.writeFile('voice.mp3', new Uint8Array(voiceBuffer));

// Mix voice at intervals
const voiceFilters = voiceTimes.map((time, idx) => 
  `[1:a]adelay=${time * 1000}|${time * 1000}[voice${idx}]`
).join(';');
```

#### Change Voice Pattern
```typescript
// More complex multi-tone pattern
sine=f=250:d=0.1[v1];sine=f=450:d=0.1[v2];sine=f=750:d=0.1[v3];sine=f=1000:d=0.1[v4]
```

## Quality Settings

### Bitrate Options
```typescript
// Ultra-low quality (prevents any professional use)
'-b:a', '64k'

// Low quality (current setting)
'-b:a', '96k'

// Medium quality (better listening experience)
'-b:a', '128k'
```

### Sample Rate Options
```typescript
// Lower quality
'-ar', '22050'

// Standard (current)
'-ar', '44100'

// High quality
'-ar', '48000'
```

## Advanced Watermarking

### Fade In/Out Watermarks
```typescript
// Fade beeps in and out
sine=frequency=1000:duration=0.2,afade=t=in:st=0:d=0.05,afade=t=out:st=0.15:d=0.05
```

### Stereo Panning
```typescript
// Pan beeps left and right alternately
[beep0]pan=stereo|c0=c0|c1=0[beep0_out];
[beep1]pan=stereo|c0=0|c1=c1[beep1_out]
```

### Frequency Modulation
```typescript
// Sweep beep frequency
sine=frequency=1000+200*sin(2*PI*t):duration=0.2
```

### White Noise Watermark
```typescript
// Add subtle white noise bursts
anoisesrc=d=0.1:c=white:r=44100:a=0.1
```

## Preset Configurations

### Subtle Protection
```typescript
// For premium previews
beepInterval: 7,
beepVolume: 0.15,
voiceInterval: 15,
voiceVolume: 0.1,
bitrate: '128k'
```

### Standard Protection (Current)
```typescript
beepInterval: 5,
beepVolume: 0.25,
voiceInterval: 10,
voiceVolume: 0.15,
bitrate: '96k'
```

### Aggressive Protection
```typescript
// For high-value content
beepInterval: 3,
beepVolume: 0.35,
voiceInterval: 7,
voiceVolume: 0.25,
bitrate: '64k'
```

## Testing Watermark Settings

### Listen Test Checklist
- [ ] Watermarks are clearly audible
- [ ] Watermarks don't completely ruin listening experience
- [ ] Music/vocals are still recognizable
- [ ] Watermarks can't be easily filtered out
- [ ] Quality reduction is noticeable

### A/B Testing
1. Generate previews with different settings
2. Survey users on preference
3. Measure conversion rates
4. Adjust based on feedback

## User Preferences

### Allow Sellers to Choose
Add watermark level selection in UploadModal:

```typescript
<select name="watermarkLevel">
  <option value="subtle">Subtle (Better listening)</option>
  <option value="standard">Standard (Recommended)</option>
  <option value="aggressive">Aggressive (Maximum protection)</option>
</select>
```

### Per-Hook Settings
Store in database:
```sql
ALTER TABLE hooks ADD COLUMN watermark_level TEXT DEFAULT 'standard';
ALTER TABLE hooks ADD COLUMN watermark_beep_interval INTEGER DEFAULT 5;
ALTER TABLE hooks ADD COLUMN watermark_voice_interval INTEGER DEFAULT 10;
```

## Watermark Removal Prevention

### Techniques Used
1. **Multiple frequencies**: Harder to filter
2. **Variable timing**: Prevents pattern matching
3. **Quality reduction**: Limits professional use
4. **Stereo placement**: Affects both channels

### Additional Protection
```typescript
// Add random timing variation
const randomOffset = Math.random() * 0.5 - 0.25;
adelay=${(time + randomOffset) * 1000}

// Add multiple overlapping watermarks
sine=f=1000:d=0.2[b1];sine=f=1050:d=0.2[b2];[b1][b2]amix
```

## Performance Impact

### Processing Time by Watermark Complexity
- Beep only: +2-3 seconds
- Beep + Voice: +3-5 seconds
- Complex multi-layer: +5-8 seconds

### Optimization Tips
1. Pre-generate common watermark patterns
2. Cache processed previews
3. Use simpler filters for longer previews
4. Consider async processing for complex watermarks

## Legal Considerations

### Watermark Disclosure
Add to terms of service:
- "All previews contain audio watermarks"
- "Watermarks protect seller intellectual property"
- "Removing watermarks is prohibited"

### DMCA Protection
Watermarks help establish:
- Proof of ownership
- Unauthorized use detection
- Legal recourse for violations
