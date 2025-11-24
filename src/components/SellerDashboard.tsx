import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Download, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, available: 0 });
  const [sales, setSales] = useState<any[]>([]);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: earningsData } = await supabase
      .from('earnings')
      .select('*')
      .eq('seller_id', user.id);

    if (earningsData) {
      const total = earningsData.reduce((sum, e) => sum + e.amount, 0);
      const pending = earningsData.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
      const available = earningsData.filter(e => e.status === 'available').reduce((sum, e) => sum + e.amount, 0);
      setEarnings({ total, pending, available });
    }

    const { data: salesData } = await supabase
      .from('purchases')
      .select('*, hooks(title)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    setSales(salesData || []);
  };

  const requestPayout = async () => {
    if (earnings.available < 50) {
      toast.error('Minimum payout is $50');
      return;
    }

    setRequesting(true);
    try {
      const { error } = await supabase.functions.invoke('request-payout', {
        body: { amount: earnings.available }
      });

      if (error) throw error;
      toast.success('Payout requested');
      loadData();
    } catch (err) {
      toast.error('Payout request failed');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-400" size={32} />
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-white text-2xl font-bold">${earnings.total.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-400" size={32} />
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-white text-2xl font-bold">${earnings.pending.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-purple-400" size={32} />
            <div>
              <p className="text-gray-400 text-sm">Available</p>
              <p className="text-white text-2xl font-bold">${earnings.available.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Button
        onClick={requestPayout}
        disabled={requesting || earnings.available < 50}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
      >
        Request Payout (Min $50)
      </Button>
    </div>
  );
};

export default SellerDashboard;
