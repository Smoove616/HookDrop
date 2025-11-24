import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ExternalLink, TrendingUp, Download, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SellerEarnings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [earnings, setEarnings] = useState({ total: 0, available: 0, pending: 0, paid: 0 });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEarnings();
      fetchRecentSales();
      checkStripeStatus();
    }
  }, [user]);

  const checkStripeStatus = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user?.id)
      .single();
    
    setStripeConnected(!!data?.stripe_account_id);
  };

  const fetchEarnings = async () => {
    const { data, error } = await supabase
      .from('earnings')
      .select('amount, status')
      .eq('user_id', user?.id);


    if (!error && data) {
      const total = data.reduce((sum, e) => sum + e.amount, 0);
      const available = data.filter(e => e.status === 'available').reduce((sum, e) => sum + e.amount, 0);
      const pending = data.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
      const paid = data.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
      setEarnings({ total, available, pending, paid });
    }
  };

  const fetchRecentSales = async () => {
    const { data } = await supabase
      .from('purchases')
      .select('*, hooks(title)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setRecentSales(data);
  };


  const requestPayout = async () => {
    if (earnings.available < 50) {
      toast({
        title: "Minimum not met",
        description: "Minimum payout amount is $50",
        variant: "destructive"
      });
      return;
    }

    setRequestingPayout(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-payout', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Payout Requested",
        description: `$${earnings.available.toFixed(2)} will be transferred to your account`,
      });
      
      fetchEarnings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request payout",
        variant: "destructive"
      });
    } finally {
      setRequestingPayout(false);
    }
  };

  const openStripeDashboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-dashboard-link');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open Stripe dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!stripeConnected && (
        <Alert>
          <AlertDescription>
            Complete Stripe Connect onboarding to receive payouts. Platform fee: 10%
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.total.toFixed(2)}</p>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">${earnings.available.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">${earnings.pending.toFixed(2)}</p>
            </div>
            <Clock className="text-orange-500" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Out</p>
              <p className="text-2xl font-bold text-blue-600">${earnings.paid.toFixed(2)}</p>
            </div>
            <CheckCircle className="text-blue-500" size={32} />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Request Payout</h3>
            <p className="text-sm text-gray-600">Minimum: $50 | Platform fee: 10%</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={requestPayout} 
              disabled={requestingPayout || earnings.available < 50 || !stripeConnected}
            >
              <Download className="mr-2 h-4 w-4" />
              Request ${earnings.available.toFixed(2)}
            </Button>
            <Button onClick={openStripeDashboard} disabled={loading} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Stripe Dashboard
            </Button>
          </div>
        </div>
      </Card>

      {recentSales.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{sale.hooks?.title}</p>
                  <p className="text-sm text-gray-600">{sale.license_type} license</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${sale.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">You earn: ${(sale.amount * 0.9).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

