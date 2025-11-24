import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { BulkHookImporter } from '@/components/BulkHookImporter';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';


const PLATFORM_USER_ID = '00000000-0000-0000-0000-000000000001';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [platformEarnings, setPlatformEarnings] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/');
      return;
    }
    
    const { data: userData } = await supabase.auth.getUser();
    const isAdmin = userData?.user?.user_metadata?.role === 'admin';
    
    if (!isAdmin) {
      toast({ title: 'Access Denied', description: 'Admin access required', variant: 'destructive' });
      navigate('/');
      return;
    }
    
    fetchPayouts();
    fetchPlatformEarnings();
  };

  const fetchPayouts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .order('requested_at', { ascending: false });
    
    if (!error && data) {
      setPayouts(data);
    }
    setLoading(false);
  };

  const fetchPlatformEarnings = async () => {
    // Fetch platform earnings (10% fee from all sales)
    const { data: earnings, error } = await supabase
      .from('earnings')
      .select('amount')
      .eq('user_id', PLATFORM_USER_ID);
    
    if (!error && earnings) {
      const total = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      setPlatformEarnings(total);
    }


    // Fetch total sales count
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('amount')
      .eq('status', 'completed');
    
    if (!purchasesError && purchases) {
      const total = purchases.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      setTotalSales(total);
    }
  };


  const updatePayoutStatus = async (payoutId: string, status: string) => {
    const { error } = await supabase
      .from('payouts')
      .update({ 
        status, 
        processed_at: new Date().toISOString(),
        processed_by: user?.id 
      })
      .eq('id', payoutId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Payout ${status}` });
      fetchPayouts();
    }
  };

  const filterPayouts = (status: string) => {
    return payouts.filter(p => p.status === status);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <p className="text-white">Loading...</p>
  </div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Platform Earnings Section */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Platform Earnings (10% Fee)</p>
                <h3 className="text-white text-3xl font-bold">${platformEarnings.toFixed(2)}</h3>
                <p className="text-purple-200 text-xs mt-1">Developer: Nathaniel Ryan</p>
              </div>
              <TrendingUp className="text-purple-200" size={48} />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Total Sales Volume</p>
                <h3 className="text-white text-3xl font-bold">${totalSales.toFixed(2)}</h3>
                <p className="text-blue-200 text-xs mt-1">All completed transactions</p>
              </div>
              <DollarSign className="text-blue-200" size={48} />
            </div>
          </Card>
        </div>

        {/* Payout Management Section */}
        <h2 className="text-2xl font-bold text-white mb-4">Payout Management</h2>
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <Clock className="text-yellow-400 mb-2" size={32} />
            <h3 className="text-white text-2xl font-bold">{filterPayouts('pending').length}</h3>
            <p className="text-gray-400">Pending</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-6">
            <CheckCircle className="text-blue-400 mb-2" size={32} />
            <h3 className="text-white text-2xl font-bold">{filterPayouts('approved').length}</h3>
            <p className="text-gray-400">Approved</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-6">
            <DollarSign className="text-green-400 mb-2" size={32} />
            <h3 className="text-white text-2xl font-bold">{filterPayouts('completed').length}</h3>
            <p className="text-gray-400">Completed</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-6">
            <XCircle className="text-red-400 mb-2" size={32} />
            <h3 className="text-white text-2xl font-bold">{filterPayouts('rejected').length}</h3>
            <p className="text-gray-400">Rejected</p>
          </Card>
        </div>


        {/* Bulk Import Section */}
        <div className="mb-8">
          <BulkHookImporter />
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>


          {['pending', 'approved', 'completed', 'rejected'].map(status => (
            <TabsContent key={status} value={status}>
              <div className="space-y-4">
                {filterPayouts(status).length === 0 ? (
                  <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                    <p className="text-gray-400">No {status} payouts</p>
                  </Card>
                ) : (
                  filterPayouts(status).map(payout => (
                    <Card key={payout.id} className="bg-gray-800 border-gray-700 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-white text-xl font-bold mb-2">${parseFloat(payout.amount).toFixed(2)}</h3>
                          <p className="text-gray-400 text-sm">User ID: {payout.user_id}</p>
                          <p className="text-gray-400 text-sm">Method: {payout.payment_method}</p>
                          <p className="text-gray-400 text-sm">Details: {payout.payment_details?.details}</p>
                          <p className="text-gray-400 text-sm">Requested: {new Date(payout.requested_at).toLocaleString()}</p>
                        </div>
                        {status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button onClick={() => updatePayoutStatus(payout.id, 'approved')} 
                              className="bg-blue-600 hover:bg-blue-700">
                              Approve
                            </Button>
                            <Button onClick={() => updatePayoutStatus(payout.id, 'rejected')} 
                              className="bg-red-600 hover:bg-red-700">
                              Reject
                            </Button>
                          </div>
                        )}
                        {status === 'approved' && (
                          <Button onClick={() => updatePayoutStatus(payout.id, 'completed')} 
                            className="bg-green-600 hover:bg-green-700">
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
