import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Zap, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const PayoutScheduleSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    auto_payout_enabled: false,
    payout_schedule: 'weekly',
    payout_day: 1,
    minimum_threshold: 50
  });
  const [nextPayout, setNextPayout] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings.auto_payout_enabled) {
      calculateNextPayout();
    }
  }, [settings]);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('payout_settings')
      .eq('user_id', user.id)
      .single();

    if (data?.payout_settings) {
      setSettings({ ...settings, ...data.payout_settings });
    }
  };

  const calculateNextPayout = () => {
    const today = new Date();
    const { payout_schedule, payout_day } = settings;
    
    if (payout_schedule === 'weekly') {
      const daysUntil = (payout_day - today.getDay() + 7) % 7;
      const next = new Date(today);
      next.setDate(today.getDate() + (daysUntil || 7));
      setNextPayout(next);
    } else if (payout_schedule === 'monthly') {
      const next = new Date(today.getFullYear(), today.getMonth(), payout_day);
      if (next < today) {
        next.setMonth(next.getMonth() + 1);
      }
      setNextPayout(next);
    }
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
      toast({ title: 'Success', description: 'Payout schedule saved!' });
    }
    setSaving(false);
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">Automated Payout Schedule</h3>
            <p className="text-sm text-gray-600 mt-1">Set up recurring payouts to your account</p>
          </div>
          <Switch
            checked={settings.auto_payout_enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, auto_payout_enabled: checked })}
          />
        </div>

        {settings.auto_payout_enabled && (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Payouts are processed automatically when your available balance reaches the minimum threshold.
              </AlertDescription>
            </Alert>

            <div>
              <Label className="mb-2 block">Payout Frequency</Label>
              <Select 
                value={settings.payout_schedule} 
                onValueChange={(val) => setSettings({ ...settings, payout_schedule: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Payout Day</Label>
              <Select 
                value={settings.payout_day.toString()} 
                onValueChange={(val) => setSettings({ ...settings, payout_day: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.payout_schedule === 'weekly' ? (
                    [1, 2, 3, 4, 5].map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {getDayName(day)}
                      </SelectItem>
                    ))
                  ) : (
                    Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        Day {day}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {nextPayout && (
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <div className="flex items-center gap-3">
                  <Calendar className="text-purple-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Next Scheduled Payout</p>
                    <p className="text-lg font-bold text-purple-900">
                      {nextPayout.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
