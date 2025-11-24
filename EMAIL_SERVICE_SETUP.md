# Email Service Setup Guide

## Overview

HookDrop requires an email service to send transactional emails for:
- Purchase confirmations and license keys
- Payout notifications
- Review responses
- Account notifications

## Choose Your Email Provider

### Option A: Resend (Recommended)

**Why Resend?**
- Simple API, developer-friendly
- Generous free tier (3,000 emails/month)
- Excellent deliverability
- Fast setup

**Setup Steps:**

1. **Create Account**
   - Go to https://resend.com
   - Sign up for free account

2. **Verify Domain** (Required for production)
   - Go to Domains > Add Domain
   - Add your domain (e.g., hookdrop.com)
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification (usually 5-10 minutes)

3. **Get API Key**
   - Go to API Keys > Create API Key
   - Name: "HookDrop Production"
   - Copy the key (starts with `re_`)

4. **Configure Environment**
   ```bash
   # Add to .env.production
   EMAIL_SERVICE_PROVIDER=resend
   RESEND_API_KEY=re_your_key_here
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   EMAIL_FROM_NAME=HookDrop
   ```

5. **Set Supabase Secrets**
   ```bash
   supabase secrets set EMAIL_SERVICE_PROVIDER=resend
   supabase secrets set RESEND_API_KEY=re_your_key_here
   supabase secrets set EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   supabase secrets set EMAIL_FROM_NAME=HookDrop
   ```

---

### Option B: SendGrid

**Why SendGrid?**
- Enterprise-grade reliability
- Free tier (100 emails/day)
- Advanced analytics
- Template management

**Setup Steps:**

1. **Create Account**
   - Go to https://sendgrid.com
   - Sign up for free account

2. **Verify Sender Identity**
   - Go to Settings > Sender Authentication
   - Choose "Single Sender Verification" (quick) or "Domain Authentication" (production)
   - Follow verification steps

3. **Get API Key**
   - Go to Settings > API Keys
   - Create API Key
   - Select "Full Access" or "Mail Send" only
   - Copy the key (starts with `SG.`)

4. **Configure Environment**
   ```bash
   # Add to .env.production
   EMAIL_SERVICE_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.your_key_here
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   EMAIL_FROM_NAME=HookDrop
   ```

5. **Set Supabase Secrets**
   ```bash
   supabase secrets set EMAIL_SERVICE_PROVIDER=sendgrid
   supabase secrets set SENDGRID_API_KEY=SG.your_key_here
   supabase secrets set EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   supabase secrets set EMAIL_FROM_NAME=HookDrop
   ```

---

## Deploy Email Function

Create `supabase/functions/send-email/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, from } = await req.json()
    
    const provider = Deno.env.get('EMAIL_SERVICE_PROVIDER') || 'resend'
    const fromAddress = from || Deno.env.get('EMAIL_FROM_ADDRESS')
    const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'HookDrop'

    if (provider === 'resend') {
      const apiKey = Deno.env.get('RESEND_API_KEY')
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: \`\${fromName} <\${fromAddress}>\`,
          to: [to],
          subject,
          html,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else if (provider === 'sendgrid') {
      const apiKey = Deno.env.get('SENDGRID_API_KEY')
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromAddress, name: fromName },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      })
      if (!response.ok) throw new Error(await response.text())
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

Deploy:
```bash
supabase functions deploy send-email
```

---

## Testing Email Service

### Test with cURL

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/send-email' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from HookDrop!</h1>"
  }'
```

### Test Purchase Email

```typescript
import { emailTemplates } from './lib/emailTemplates'

const template = emailTemplates.purchase({
  hookTitle: "Summer Vibes",
  amount: 29.99,
  licenseType: "Basic",
  licenseKey: "HOOK-12345-ABCDE"
})

// Send via edge function
await supabase.functions.invoke('send-email', {
  body: {
    to: 'buyer@example.com',
    ...template
  }
})
```

---

## Production Checklist

- [ ] Domain verified with email provider
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] API key generated and stored securely
- [ ] Supabase secrets configured
- [ ] send-email function deployed
- [ ] Test email sent successfully
- [ ] From address matches verified domain
- [ ] Monitor email deliverability in provider dashboard

---

## Troubleshooting

### Emails Not Sending

1. **Check API Key**
   ```bash
   supabase secrets list
   # Verify EMAIL_SERVICE_PROVIDER and API key are set
   ```

2. **Check Function Logs**
   ```bash
   supabase functions logs send-email
   ```

3. **Verify Domain**
   - Resend: Check Domains page for green checkmark
   - SendGrid: Check Sender Authentication status

### Emails Going to Spam

1. **Verify Domain Authentication**
   - Add SPF, DKIM, DMARC records
   - Use your own domain, not gmail/yahoo

2. **Check Content**
   - Avoid spam trigger words
   - Include unsubscribe link
   - Use proper HTML structure

3. **Warm Up Domain**
   - Start with low volume
   - Gradually increase over weeks
   - Monitor bounce/complaint rates

---

## Cost Estimates

### Resend
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Scale: $80/month for 250,000 emails

### SendGrid
- Free: 100 emails/day (3,000/month)
- Essentials: $19.95/month for 50,000 emails
- Pro: $89.95/month for 100,000 emails

**Recommendation:** Start with free tier, upgrade as you grow.
