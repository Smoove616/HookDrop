import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [converted, setConverted] = useState(0);
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    convertCurrency();
  }, [amount, toCurrency]);

  const convertCurrency = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setLoading(true);
    const { data } = await supabase.functions.invoke('get-exchange-rates', {
      body: { currencies: [toCurrency] }
    });

    if (data?.rates?.[toCurrency]) {
      const exchangeRate = data.rates[toCurrency];
      setRate(exchangeRate);
      setConverted(Number(amount) * exchangeRate);
    }
    setLoading(false);
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === toCurrency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Currency Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Amount in USD</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        <div>
          <Label>Convert to</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(curr => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 bg-primary/10 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">You will receive</p>
          <p className="text-2xl font-bold">
            {selectedCurrency?.symbol}{converted.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Rate: 1 USD = {rate.toFixed(4)} {toCurrency}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
