import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Calendar, Loader2, Globe } from 'lucide-react';

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
];


export const PayoutSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    auto_payout_enabled: false,
    payout_schedule: 'weekly',
    minimum_threshold: 50,
    payout_day: 1,
    currency: 'USD'
  });


  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('payout_settings')
      .eq('user_id', user.id)
      .single();

    if (!error && data?.payout_settings) {
      setSettings({ ...settings, ...data.payout_settings });
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        payout_settings: settings
      });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Payout settings saved!' });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Automated Payout Settings</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Enable Automated Payouts</Label>
            <p className="text-sm text-gray-400">Automatically transfer earnings to your account</p>
          </div>
          <Switch
            checked={settings.auto_payout_enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, auto_payout_enabled: checked })}
          />
        </div>

        {settings.auto_payout_enabled && (
          <>
            <div>
              <Label className="text-white mb-2 block">Payout Schedule</Label>
              <Select value={settings.payout_schedule} onValueChange={(val) => setSettings({ ...settings, payout_schedule: val })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>


            <div>
              <Label className="text-white mb-2 block flex items-center gap-2">
                <Globe size={16} />
                Payout Currency
              </Label>
              <Select value={settings.currency} onValueChange={(val) => setSettings({ ...settings, currency: val })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {SUPPORTED_CURRENCIES.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-400 mt-1">
                Payouts will be converted to {settings.currency} using Stripe's exchange rates
              </p>
            </div>


            <div>
              <Label className="text-white mb-2 block">Minimum Payout Threshold</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="text-gray-400" size={20} />
                <Input
                  type="number"
                  min="10"
                  step="10"
                  value={settings.minimum_threshold}
                  onChange={(e) => setSettings({ ...settings, minimum_threshold: parseFloat(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">Minimum: $10</p>
            </div>

            <div>
              <Label className="text-white mb-2 block">Payout Day</Label>
              <Select value={settings.payout_day.toString()} onValueChange={(val) => setSettings({ ...settings, payout_day: parseInt(val) })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.payout_schedule === 'weekly' ? (
                    <>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                    </>
                  ) : (
                    Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button onClick={saveSettings} disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700">
          {saving ? <><Loader2 className="mr-2 animate-spin" size={16} /> Saving...</> : 'Save Settings'}
        </Button>
      </div>
    </Card>
  );
};
