import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, Clock, CheckCircle, Calendar, Zap } from 'lucide-react';
import { PayoutHistory } from './PayoutHistory';
import { PayoutSettings } from './PayoutSettings';

export const PayoutDashboard: React.FC = () => {
  const { toast } = useToast();
  const [earnings, setEarnings] = useState({ available: 0, pending: 0, paid: 0 });
  const [nextPayout, setNextPayout] = useState<Date | null>(null);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch earnings
    const { data: earningsData } = await supabase
      .from('earnings')
      .select('amount, status')
      .eq('seller_id', user.id);

    if (earningsData) {
      const available = earningsData.filter(e => e.status === 'available').reduce((s, e) => s + e.amount, 0);
      const pending = earningsData.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
      const paid = earningsData.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
      setEarnings({ available, pending, paid });
    }

    // Fetch payout settings
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('payout_settings')
      .eq('user_id', user.id)
      .single();

    if (prefs?.payout_settings?.auto_payout_enabled) {
      setAutoPayoutEnabled(true);
      calculateNextPayout(prefs.payout_settings);
    }

    setLoading(false);
  };

  const calculateNextPayout = (settings: any) => {
    const today = new Date();
    const payoutDay = settings.payout_day;
    
    if (settings.payout_schedule === 'weekly') {
      const daysUntil = (payoutDay - today.getDay() + 7) % 7;
      const next = new Date(today);
      next.setDate(today.getDate() + (daysUntil || 7));
      setNextPayout(next);
    } else if (settings.payout_schedule === 'monthly') {
      const next = new Date(today.getFullYear(), today.getMonth(), payoutDay);
      if (next < today) {
        next.setMonth(next.getMonth() + 1);
      }
      setNextPayout(next);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Available Balance</h3>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">${earnings.available.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-1">Ready for payout</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Pending</h3>
            <Clock size={24} />
          </div>
          <p className="text-3xl font-bold">${earnings.pending.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-1">Processing</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Paid Out</h3>
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-bold">${earnings.paid.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-1">All time</p>
        </Card>
      </div>

      {autoPayoutEnabled && nextPayout && (
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <Zap className="text-purple-600" size={24} />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900">Automated Payouts Enabled</h4>
              <p className="text-sm text-purple-700">
                Next payout: {nextPayout.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Badge className="bg-purple-600">Active</Badge>
          </div>
        </Card>
      )}

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Payout History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="mt-6">
          <PayoutHistory />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <PayoutSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
