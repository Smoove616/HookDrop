# Multi-Currency Payout System

Complete guide for implementing multi-currency support in the automated payout system using Stripe's currency conversion.

## Overview

The multi-currency payout system allows international sellers to receive payouts in their local currency with:
- ✅ 15+ supported currencies
- ✅ Automatic currency conversion using Stripe's exchange rates
- ✅ Display amounts in both local currency and USD
- ✅ Currency-specific tax reporting
- ✅ Real-time exchange rate tracking

## Supported Currencies

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- JPY (Japanese Yen)
- CHF (Swiss Franc)
- SEK (Swedish Krona)
- NOK (Norwegian Krone)
- DKK (Danish Krone)
- NZD (New Zealand Dollar)
- SGD (Singapore Dollar)
- HKD (Hong Kong Dollar)
- MXN (Mexican Peso)
- BRL (Brazilian Real)

## Database Schema Updates

```sql
-- Add currency fields to payouts table
ALTER TABLE payouts 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS amount_local DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS amount_usd DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,6);

-- Update user_preferences to include currency
UPDATE user_preferences 
SET payout_settings = payout_settings || '{"currency": "USD"}'::jsonb
WHERE payout_settings->>'currency' IS NULL;

-- Create index for currency queries
CREATE INDEX IF NOT EXISTS idx_payouts_currency ON payouts(currency);
```

## Updated Edge Functions

### Process Automated Payouts (Multi-Currency)

Update `supabase/functions/process-automated-payouts/index.ts`:

```typescript
// Inside the payout processing loop, replace the transfer creation:

const currency = settings.currency || 'usd';

// Get exchange rate if not USD
let exchangeRate = 1;
let amountLocal = availableBalance;
let amountUSD = availableBalance;

if (currency.toLowerCase() !== 'usd') {
  // Stripe automatically converts using their rates
  // We'll fetch the rate after the transfer
  const rates = await stripe.exchangeRates.retrieve(currency.toLowerCase());
  exchangeRate = rates.rates.usd || 1;
  amountLocal = availableBalance / exchangeRate;
}

const transfer = await stripe.transfers.create({
  amount: Math.round(amountLocal * 100),
  currency: currency.toLowerCase(),
  destination: stripeAccountId,
  description: `Automated payout for ${today.toDateString()}`
});

// Record payout with currency info
const { error: payoutError } = await supabase
  .from('payouts')
  .insert({
    user_id: userPref.user_id,
    amount: availableBalance,
    amount_local: amountLocal,
    amount_usd: amountUSD,
    currency: currency.toUpperCase(),
    exchange_rate: exchangeRate,
    status: 'completed',
    stripe_transfer_id: transfer.id,
    is_automatic: true,
    processed_at: new Date().toISOString()
  });
```

### Retry Failed Payouts (Multi-Currency)

Update `supabase/functions/retry-failed-payouts/index.ts`:

```typescript
// Inside retry loop:

const currency = payout.currency || 'USD';
const amountLocal = payout.amount_local || payout.amount;

const transfer = await stripe.transfers.create({
  amount: Math.round(parseFloat(amountLocal) * 100),
  currency: currency.toLowerCase(),
  destination: stripeAccountId,
  description: `Retry payout #${payout.id}`
});
```

## Frontend Components

The following components have been updated to support multi-currency:

### PayoutSettings.tsx
- Added currency selection dropdown with 15 currencies
- Currency preference saved to user_preferences
- Visual currency symbols displayed

### PayoutHistory.tsx
- Displays amounts in seller's local currency
- Shows USD equivalent for non-USD currencies
- Exchange rate displayed in detail modal
- Currency-specific tax reports with both amounts

## Tax Reporting

Tax reports now include:
- Local currency amount
- USD equivalent amount
- Exchange rate at time of payout
- Currency code

Format: `Payout ID,Date,Local Amount (EUR),USD Amount,Exchange Rate,Status,Transfer ID,Payment Method`

## Testing Multi-Currency

1. Go to Profile > Earnings > Payout Settings
2. Enable automated payouts
3. Select desired currency from dropdown
4. Set minimum threshold (in USD equivalent)
5. Save settings
6. Process a test payout
7. Verify amounts displayed in both currencies
8. Download tax report to verify currency data

## Important Notes

- All earnings are tracked in USD internally
- Currency conversion happens at payout time using Stripe's rates
- Exchange rates are stored for historical accuracy
- Sellers can change currency preference anytime
- Minimum thresholds are in USD to maintain consistency
- Stripe Connect accounts must support the selected currency

## Stripe Connect Currency Support

Ensure seller's Stripe Connect account supports their chosen currency:
- Account country must support the currency
- Bank account must accept the currency
- Some currencies require additional verification

## Future Enhancements

- Real-time exchange rate display
- Currency conversion preview before payout
- Multi-currency earnings tracking
- Currency-specific minimum thresholds
- Historical exchange rate charts
