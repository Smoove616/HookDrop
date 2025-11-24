# Bulk Hook Import System

## Overview
Admin feature for bulk importing hooks via CSV metadata file and audio file uploads. Includes validation, automatic processing, and database insertion.

## Edge Function: process-bulk-hooks

Deploy this function when Supabase project is active:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const csvText = formData.get('csv') as string;
    
    if (!csvText) {
      throw new Error('CSV file is required');
    }

    // Parse CSV
    const lines = csvText.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredFields = ['title', 'description', 'genre', 'bpm', 'key', 'price', 'audio_filename'];
    const missingFields = requiredFields.filter(f => !headers.includes(f));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required CSV fields: ${missingFields.join(', ')}`);
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization required');

    // Get seller_id from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const [, payload] = jwt.split('.');
    const decoded = JSON.parse(atob(payload));
    const sellerId = decoded.sub;

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((h, idx) => { row[h] = values[idx]; });

        // Find matching audio file
        const audioFile = formData.get(`audio_${i-1}`);
        if (!audioFile || !(audioFile instanceof File)) {
          results.errors.push(`Row ${i}: Audio file not found`);
          results.failed++;
          continue;
        }

        // Validate file format
        const validFormats = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
        if (!validFormats.includes(audioFile.type) && 
            !audioFile.name.endsWith('.mp3') && 
            !audioFile.name.endsWith('.wav')) {
          results.errors.push(`Row ${i}: Invalid audio format (MP3/WAV only)`);
          results.failed++;
          continue;
        }

        // Validate file size (2MB = ~30 seconds of audio)
        if (audioFile.size > 2 * 1024 * 1024) {
          results.errors.push(`Row ${i}: Audio file too large (max 30 seconds)`);
          results.failed++;
          continue;
        }

        // Upload to Supabase Storage
        const fileName = `${crypto.randomUUID()}.${audioFile.name.split('.').pop()}`;
        const uploadResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/hooks/${fileName}`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': audioFile.type
            },
            body: audioFile
          }
        );

        if (!uploadResponse.ok) {
          results.errors.push(`Row ${i}: Failed to upload audio`);
          results.failed++;
          continue;
        }

        const audioUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/hooks/${fileName}`;

        // Generate waveform (simplified - use actual audio analysis in production)
        const waveformData = Array.from({ length: 100 }, () => Math.random() * 100);

        // Insert into database
        const dbResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/rest/v1/hooks`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              seller_id: sellerId,
              title: row.title,
              description: row.description,
              genre: row.genre,
              bpm: parseInt(row.bpm),
              key: row.key,
              price: parseFloat(row.price),
              audio_url: audioUrl,
              waveform_data: waveformData,
              duration: 30
            })
          }
        );

        if (dbResponse.ok) {
          results.success++;
        } else {
          const error = await dbResponse.text();
          results.errors.push(`Row ${i}: DB insert failed`);
          results.failed++;
        }
      } catch (error: any) {
        results.errors.push(`Row ${i}: ${error.message}`);
        results.failed++;
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
## Deployment

```bash
supabase functions deploy process-bulk-hooks
```

## Usage

1. Admin logs in and navigates to Admin Dashboard
2. Scrolls to "Bulk Hook Importer" section
3. Uploads CSV file with hook metadata
4. Uploads corresponding audio files (in same order as CSV rows)
5. Clicks "Import Hooks" button
6. System validates and processes each hook
7. Results displayed with success/failure counts

## Sample CSV Template

Download or create a CSV file with this format:

```csv
title,description,genre,bpm,key,price,audio_filename
Boom Bap Classic,Old school hip hop beat with vinyl crackle,Hip Hop,90,C Minor,19.99,hook1.mp3
Street Flow,Modern trap-influenced hip hop hook,Hip Hop,85,G Minor,24.99,hook2.mp3
Hard 808s,Heavy trap beat with rolling hi-hats,Trap,140,E Minor,29.99,hook3.mp3
Festival Drop,High-energy big room house hook,EDM,128,C Major,34.99,hook4.mp3
Sunrise Melody,Melodic dubstep with emotional build,EDM,140,F Major,34.99,hook5.mp3
```

## Validation Details

### Audio File Validation
- **Formats**: MP3 (.mp3) or WAV (.wav) only
- **Size Limit**: 2MB (approximately 30 seconds at standard quality)
- **Duration**: Maximum 30 seconds enforced via file size

### CSV Validation
- **Required Columns**: All 7 columns must be present
- **Column Order**: Can be in any order (matched by header name)
- **Case Insensitive**: Column names are case-insensitive
- **Data Types**:
  - title: Text (required)
  - description: Text (required)
  - genre: Text (required)
  - bpm: Integer (required)
  - key: Text (required, e.g., "C Minor", "G Major")
  - price: Decimal (required, e.g., 19.99)
  - audio_filename: Text (reference only, not used for matching)

### File Matching
- Audio files are matched to CSV rows by upload order
- First audio file → First CSV row (after header)
- Second audio file → Second CSV row
- And so on...

## Error Handling

The system provides detailed error messages for:
- Missing CSV columns
- Invalid audio file formats
- File size violations (>30 seconds)
- Storage upload failures
- Database insertion errors
- Missing audio files for CSV rows

All errors are logged and displayed in the UI with row numbers for easy debugging.

## Post-Import

After successful import:
- Hooks are immediately available in the marketplace
- All hooks are owned by the admin user who performed the import
- Waveform data is auto-generated (simplified version)
- Audio files are stored in Supabase Storage "hooks" bucket
- Database records created with all metadata

## Tips for Best Results

1. **Prepare Audio Files**: Ensure all files are under 30 seconds and properly formatted
2. **Test Small Batch**: Start with 2-3 hooks to verify the process
3. **Consistent Naming**: Use clear, sequential filenames (hook1.mp3, hook2.mp3, etc.)
4. **Verify CSV**: Open CSV in text editor to ensure proper formatting
5. **Check Order**: Audio file upload order must match CSV row order
6. **Monitor Results**: Review success/failure counts and error messages
