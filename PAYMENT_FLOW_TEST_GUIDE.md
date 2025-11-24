# Payment Flow End-to-End Testing Guide

## Code Review Summary ✅

I've reviewed the complete payment implementation:

### ✅ Components Verified:
- **ShoppingCart.tsx**: Properly calls `create-checkout-session` edge function
- **CartContext.tsx**: Manages cart state with localStorage persistence
- **HookCard.tsx**: Add to cart functionality implemented
- **PurchaseSuccess.tsx**: Displays purchase confirmation with license key
- **stripe-webhook**: Handles checkout completion, creates purchases, splits earnings

### ⚠️ Issues Found:

1. **CRITICAL**: `create-checkout-session` edge function may not be deployed
   - Code exists in documentation (CRITICAL_CHECKOUT_FUNCTION_DEPLOY.md)
   - Need to verify deployment status

2. **BUG**: Success URL mismatch
   - Current: Redirects to `/profile?purchase=success`
   - Should be: `/purchase-success?session_id={CHECKOUT_SESSION_ID}`
   - This prevents PurchaseSuccess page from loading purchase details

## Manual Testing Steps

### Prerequisites:
- Stripe test mode enabled
- Test card: `4242 4242 4242 4242`
- Any future date for expiry
- Any 3-digit CVC
- Any ZIP code

### Step 1: Browse Hooks
1. Navigate to `/discover`
2. Verify hooks are displayed with prices
3. Check both non-exclusive and exclusive prices shown

**Expected**: Grid of hooks with "Add to Cart" buttons

### Step 2: Add to Cart
1. Click "Add to Cart" on a hook
2. Check cart icon in navigation updates count
3. Click cart icon to open cart sidebar
4. Verify hook appears with correct:
   - Title
   - Artist name
   - License type
   - Price

**Expected**: Toast notification + cart count increases

### Step 3: Checkout Process
1. In cart, click "Checkout" button
2. Verify redirect to Stripe checkout page
3. Check line items show correct hook + license type
4. Fill in test card: `4242 4242 4242 4242`
5. Complete payment

**Expected**: Smooth redirect to Stripe, no errors

### Step 4: Verify Purchase Success
⚠️ **KNOWN ISSUE**: May redirect to /profile instead of /purchase-success

**If redirected to /profile:**
- Check "My Purchases" tab
- Verify purchase appears in list

**If redirected to /purchase-success:**
- Verify purchase details displayed
- Check license key is shown
- Test "Copy License Key" button
- Click "Download Hook" button

### Step 5: Verify Seller Earnings
1. Login as the seller account
2. Navigate to seller dashboard
3. Check "Earnings" section
4. Verify:
   - Purchase appears in earnings history
   - Amount = 90% of sale price (10% platform fee)
   - Status = "available"

### Step 6: Database Verification
Check Supabase dashboard:

**purchases table:**
```sql
SELECT * FROM purchases 
WHERE stripe_session_id = 'cs_test_...' 
ORDER BY created_at DESC LIMIT 1;
```
Verify:
- license_key generated
- amount correct
- status = 'completed'

**earnings table:**
```sql
SELECT * FROM earnings 
WHERE purchase_id = '[purchase_id]';
```
Should show 2 records:
- Seller: 90% of amount
- Platform: 10% of amount

## Troubleshooting

### "Failed to create checkout session"
**Cause**: create-checkout-session function not deployed or misconfigured

**Fix**:
```bash
# Deploy the function
supabase functions deploy create-checkout-session --no-verify-jwt

# Verify STRIPE_SECRET_KEY is set
supabase secrets list
```

### Purchase not appearing after payment
**Cause**: Webhook not receiving events or failing

**Check**:
1. Stripe Dashboard → Developers → Webhooks
2. Verify webhook endpoint exists:
   `https://cgsdkzoswqohkchznjsw.supabase.co/functions/v1/stripe-webhook`
3. Check webhook logs for errors
4. Verify events include: `checkout.session.completed`

### Can't download purchased hook
**Cause**: Storage bucket not configured or file missing

**Fix**:
1. Supabase → Storage → hooks bucket
2. Verify RLS policies allow authenticated downloads
3. Check file exists: `[hook_id].mp3`

## Required Fixes

### Fix 1: Deploy create-checkout-session
See: `CRITICAL_CHECKOUT_FUNCTION_DEPLOY.md`

### Fix 2: Update Success URL
The checkout session needs to redirect to the correct page with session_id.

## Test Checklist

- [ ] Hooks display on /discover
- [ ] Add to cart works (toast + count updates)
- [ ] Cart sidebar shows items correctly
- [ ] Checkout button redirects to Stripe
- [ ] Payment completes successfully
- [ ] Redirected to success page (or profile)
- [ ] Purchase appears in database
- [ ] License key generated
- [ ] Seller earnings created (90%)
- [ ] Platform fee recorded (10%)
- [ ] Download link works
- [ ] Exclusive license marks hook unavailable

## Success Criteria

✅ Complete payment flow works without errors
✅ Purchase record created in database
✅ License key generated and displayed
✅ Seller receives 90% earnings
✅ Platform receives 10% fee
✅ User can download purchased hook
✅ Exclusive purchases mark hook as unavailable

## Next Steps After Testing

1. If create-checkout-session not deployed → Deploy it
2. If success URL wrong → Update checkout session creation
3. If webhook failing → Check Stripe webhook configuration
4. If downloads fail → Fix storage RLS policies
