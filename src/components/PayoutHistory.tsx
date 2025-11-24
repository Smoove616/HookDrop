import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Download, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, FileText, Zap } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const PayoutHistory: React.FC = () => {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [earnings, setEarnings] = useState<any[]>([]);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setPayouts(data);
    setLoading(false);
  };

  const fetchPayoutEarnings = async (payoutId: string) => {
    const { data } = await supabase
      .from('earnings')
      .select('*, purchases(*, hooks(title))')
      .eq('payout_id', payoutId);

    if (data) setEarnings(data);
  };

  const downloadTaxReport = async (payout: any) => {
    try {
      await fetchPayoutEarnings(payout.id);
      const report = generateTaxReport(payout);
      const blob = new Blob([report], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payout-${payout.id}-tax-report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Tax Report Downloaded",
        description: "Your payout tax report has been generated"
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const generateTaxReport = (payout: any) => {
    const header = `Payout ID,Date,Amount,Status,Transfer ID,Payment Method,Processed Date\n`;
    const payoutLine = `${payout.id},${new Date(payout.created_at).toLocaleDateString()},$${payout.amount.toFixed(2)},${payout.status},${payout.stripe_transfer_id || 'N/A'},${payout.payment_method || 'Stripe Connect'},${payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : 'N/A'}\n\n`;
    
    const earningsHeader = `Hook Title,Sale Amount,Your Earnings (90%),Sale Date\n`;
    const earningsLines = earnings.map(e => 
      `${e.purchases?.hooks?.title || 'N/A'},$${e.purchases?.amount.toFixed(2) || '0.00'},$${e.amount.toFixed(2)},${new Date(e.created_at).toLocaleDateString()}`
    ).join('\n');
    
    return header + payoutLine + earningsHeader + earningsLines;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      case 'failed': return <AlertCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  const openDetails = async (payout: any) => {
    await fetchPayoutEarnings(payout.id);
    setSelectedPayout(payout);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Payout History</h3>
      </div>

      {payouts.length === 0 ? (
        <Card className="p-8 text-center">
          <DollarSign className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No payout history yet</p>
          <p className="text-sm text-gray-500 mt-2">Payouts are processed when you reach $50 in available earnings</p>
        </Card>
      ) : (
        payouts.map(payout => (
          <Card key={payout.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(payout.status)}
                  <Badge variant={payout.status === 'completed' ? 'default' : payout.status === 'failed' ? 'destructive' : 'secondary'}>
                    {payout.status}
                  </Badge>
                  {payout.payout_type === 'automated' && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Zap size={12} className="mr-1" />
                      Automated
                    </Badge>
                  )}
                  {payout.currency && payout.currency !== 'USD' && (
                    <Badge variant="outline">{payout.currency}</Badge>
                  )}
                </div>

                <p className="text-2xl font-bold">
                  {payout.currency && payout.currency !== 'USD' ? payout.currency : '$'} {payout.amount.toFixed(2)}
                </p>

                <div className="text-sm text-gray-600 space-y-1 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(payout.created_at).toLocaleString()}</span>
                  </div>
                  {payout.processed_at && (
                    <p className="text-green-600">Processed: {new Date(payout.processed_at).toLocaleString()}</p>
                  )}
                  {payout.stripe_transfer_id && (
                    <p className="font-mono text-xs">Transfer: {payout.stripe_transfer_id}</p>
                  )}
                </div>

              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openDetails(payout)}>
                  <FileText size={14} className="mr-1" />
                  Details
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadTaxReport(payout)}>
                  <Download size={14} className="mr-1" />
                  Tax Report
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}

      <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold">${selectedPayout.amount.toFixed(2)}</span>
                <span className="text-gray-600">Status:</span>
                <Badge className="w-fit">{selectedPayout.status}</Badge>
                <span className="text-gray-600">Created:</span>
                <span>{new Date(selectedPayout.created_at).toLocaleString()}</span>
                {selectedPayout.processed_at && (
                  <>
                    <span className="text-gray-600">Processed:</span>
                    <span>{new Date(selectedPayout.processed_at).toLocaleString()}</span>
                  </>
                )}
                {selectedPayout.stripe_transfer_id && (
                  <>
                    <span className="text-gray-600">Transfer ID:</span>
                    <span className="font-mono text-xs">{selectedPayout.stripe_transfer_id}</span>
                  </>
                )}
              </div>

              {earnings.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Included Sales ({earnings.length})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {earnings.map(earning => (
                      <div key={earning.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>{earning.purchases?.hooks?.title || 'Unknown Hook'}</span>
                        <span className="font-semibold text-green-600">${earning.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
