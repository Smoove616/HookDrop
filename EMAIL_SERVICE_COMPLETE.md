# HookDrop Email Service - Complete Setup

## ✅ Configured Components

### 1. Email Templates (src/lib/emailTemplates.ts)
- Welcome emails for new users
- Purchase confirmations for buyers
- License delivery with download links
- Seller sale notifications
- Payout processed notifications
- Review response notifications

### 2. Send Email Edge Function
- Already deployed at: `send-email`
- Uses Resend API (RESEND_API_KEY configured)
- Supports both direct HTML and template-based emails

### 3. Email Preferences UI
- Located in Profile → Preferences tab
- Users can toggle:
  - Review responses
  - Purchase notifications
  - Payout updates
  - License delivery
  - Marketing emails
- Preferences saved to `user_preferences` table

## 🧪 Testing the Email Flow

### Test Welcome Email
```javascript
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'test@example.com',
    subject: 'Welcome to HookDrop!',
    html: emailTemplates.welcome({ name: 'Test User' }).html
  }
});
```

### Test Purchase Confirmation
```javascript
await supabase.functions.invoke('send-email', {
  body: {
    to: 'buyer@example.com',
    ...emailTemplates.purchaseConfirmation({
      buyerName: 'John',
      hookTitle: 'Fire Beat',
      amount: 29.99,
      licenseType: 'Basic',
      downloadUrl: 'https://hookdrop.com/download/123'
    })
  }
});
```

## 📋 Database Schema

The `user_preferences` table should have these columns:
- `user_id` (uuid, primary key)
- `email_on_review_response` (boolean)
- `email_on_purchase` (boolean)
- `email_on_payout` (boolean)
- `email_on_license_delivery` (boolean)
- `email_marketing` (boolean)
- `updated_at` (timestamp)

## 🚀 Integration Points

### On User Signup (AuthContext)
```typescript
await supabase.functions.invoke('send-email', {
  body: {
    to: user.email,
    ...emailTemplates.welcome({ name: user.name })
  }
});
```

### On Purchase (Stripe Webhook)
```typescript
// Send to buyer
await supabase.functions.invoke('send-email', {
  body: { to: buyerEmail, ...emailTemplates.purchaseConfirmation(data) }
});

// Send to seller
await supabase.functions.invoke('send-email', {
  body: { to: sellerEmail, ...emailTemplates.sellerSale(data) }
});
```

### On Payout (Payout System)
```typescript
await supabase.functions.invoke('send-email', {
  body: {
    to: sellerEmail,
    ...emailTemplates.payoutProcessed({ amount, status })
  }
});
```

## ✨ Next Steps

1. Update `user_preferences` table schema if needed
2. Integrate email sending into signup flow
3. Add email notifications to stripe-webhook function
4. Test with real email addresses
5. Configure Resend domain for production

## 🔧 Resend Configuration

- API Key: Already configured in Supabase secrets
- From address: `notifications@hookdrop.com`
- For production: Verify domain in Resend dashboard
