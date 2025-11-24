# Multi-Currency Exchange Rate System Setup

## Overview
This guide extends the multi-currency payout system with real-time exchange rate displays, currency converter tools, and historical trend charts for international sellers.

## Components Created

### 1. ExchangeRateWidget
- Displays current exchange rates for all supported currencies
- Shows conversion rates from USD to 8 major currencies
- Includes refresh button for real-time updates
- Auto-updates timestamp

### 2. CurrencyConverter
- Interactive tool for sellers to preview payout amounts
- Real-time conversion from USD to selected currency
- Shows current exchange rate
- Helps sellers understand exact amounts they'll receive

### 3. ExchangeRateChart
- 30-day historical exchange rate trends
- Interactive line chart using Recharts
- Currency selector dropdown
- Visual representation of rate fluctuations

## Edge Function Setup

### Create `get-exchange-rates` Edge Function

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
    const { currencies, historical, days } = await req.json();
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    // Fetch current rates from Stripe API
    const response = await fetch('https://api.stripe.com/v1/exchange_rates/usd', {
      headers: { 'Authorization': `Bearer ${stripeKey}` }
    });

    const data = await response.json();
    
    const rates: Record<string, number> = {};
    currencies.forEach((curr: string) => {
      rates[curr] = data.rates?.[curr.toLowerCase()] || 1;
    });

    // Generate historical data (for production, store daily rates in database)
    let historicalData = null;
    if (historical && days) {
      historicalData = [];
      const currentRate = rates[currencies[0]];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = (Math.random() - 0.5) * 0.04;
        const rate = currentRate * (1 + variation);
        
        historicalData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rate: parseFloat(rate.toFixed(4))
        });
      }
    }

    return new Response(
      JSON.stringify({ rates, historical: historicalData }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
```

Deploy with:
```bash
supabase functions deploy get-exchange-rates
```

## Production Enhancements

### 1. Store Historical Rates
For production, create a table to store daily exchange rates:

```sql
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10, 6) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(currency, date)
);

CREATE INDEX idx_exchange_rates_currency_date ON exchange_rates(currency, date DESC);
```

### 2. Daily Rate Cron Job
Set up a cron job to fetch and store rates daily:

```typescript
// supabase/functions/fetch-daily-rates/index.ts
Deno.serve(async (req) => {
  const currencies = ['EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK'];
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  const response = await fetch('https://api.stripe.com/v1/exchange_rates/usd', {
    headers: { 'Authorization': `Bearer ${stripeKey}` }
  });
  
  const data = await response.json();
  
  for (const currency of currencies) {
    await supabase.from('exchange_rates').insert({
      currency,
      rate: data.rates[currency.toLowerCase()],
      date: new Date().toISOString().split('T')[0]
    });
  }
  
  return new Response(JSON.stringify({ success: true }));
});
```

Schedule in Supabase dashboard: Daily at 00:00 UTC

## Features

### Real-Time Exchange Rates
- Fetches current rates from Stripe API
- Updates on demand with refresh button
- Displays rates for 8 major currencies
- Shows last updated timestamp

### Currency Converter
- Input USD amount
- Select target currency
- See converted amount instantly
- View current exchange rate

### Historical Trends
- 30-day rate history chart
- Select any supported currency
- Visual trend analysis
- Helps sellers plan optimal payout timing

## Integration

The components are integrated into the Profile page's Earnings tab:
- Exchange Rate Widget (top left)
- Currency Converter (top right)
- Exchange Rate Chart (full width below)
- Payout Settings (with currency selection)
- Payout History (showing multi-currency payouts)

## Testing

1. Navigate to Profile > Earnings tab
2. View current exchange rates in the widget
3. Use currency converter to preview amounts
4. Check 30-day trend chart for selected currency
5. Configure payout currency in settings
6. Verify payout history shows correct currencies

## Notes

- Exchange rates are fetched from Stripe's API
- Rates update in real-time when refresh is clicked
- Historical data is simulated for demo (implement database storage for production)
- All components handle loading and error states gracefully
- Currency symbols are displayed correctly for each currency
