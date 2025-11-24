import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface ExchangeRate {
  currency: string;
  rate: number;
  symbol: string;
}

export function ExchangeRateWidget() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const currencies = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  ];

  const fetchRates = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('get-exchange-rates', {
      body: { currencies: currencies.map(c => c.code) }
    });

    if (!error && data?.rates) {
      const rateData = currencies.map(c => ({
        currency: c.code,
        rate: data.rates[c.code] || 1,
        symbol: c.symbol
      }));
      setRates(rateData);
      setLastUpdated(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Exchange Rates (1 USD =)</CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchRates} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {rates.map(rate => (
            <div key={rate.currency} className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="font-medium">{rate.currency}</span>
              <span>{rate.symbol}{rate.rate.toFixed(4)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
