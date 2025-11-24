import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Download, Calendar, Users, DollarSign, TrendingUp, Upload } from 'lucide-react';
import { toast } from 'sonner';
import TierDistributionChart from './TierDistributionChart';
import ConversionFunnelChart from './ConversionFunnelChart';
import MRRChart from './MRRChart';
import ChurnRateChart from './ChurnRateChart';
import UploadPerformanceChart from './UploadPerformanceChart';

const SubscriptionAnalytics: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-subscription-analytics', {
        body: { startDate, endDate }
      });
      if (error) throw error;
      setAnalytics(data);
    } catch (error: any) {
      toast.error('Failed to fetch subscription analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const exportCSV = async () => {
    if (!analytics) return;
    const csv = `Subscription Analytics Report
Date Range: ${startDate} to ${endDate}

Total Users: ${analytics.summary.totalUsers}
MRR: $${analytics.summary.totalMRR}
Churn Rate: ${analytics.summary.avgChurnRate}%

Tier Distribution:
${analytics.tierDistribution.map((t: any) => `${t.tier}: ${t.count} (${t.percentage}%)`).join('\n')}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscription-analytics-${Date.now()}.csv`;
    a.click();
    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-white text-sm mb-2 block">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-700 text-white" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-white text-sm mb-2 block">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-700 text-white" />
          </div>
          <Button onClick={fetchAnalytics} disabled={loading}><Calendar className="mr-2" size={16} />Apply</Button>
          <Button onClick={exportCSV} variant="outline"><Download className="mr-2" size={16} />Export</Button>
        </div>
      </Card>

      {analytics && (
        <>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 p-6">
              <Users className="text-white mb-2" size={24} />
              <div className="text-3xl font-bold text-white">{analytics.summary.totalUsers}</div>
              <div className="text-blue-100 text-sm">Total Users</div>
            </Card>
            <Card className="bg-gradient-to-br from-green-600 to-green-700 p-6">
              <DollarSign className="text-white mb-2" size={24} />
              <div className="text-3xl font-bold text-white">${analytics.summary.totalMRR.toFixed(0)}</div>
              <div className="text-green-100 text-sm">Monthly MRR</div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 p-6">
              <TrendingUp className="text-white mb-2" size={24} />
              <div className="text-3xl font-bold text-white">{analytics.summary.conversionRate.toFixed(1)}%</div>
              <div className="text-purple-100 text-sm">Conversion Rate</div>
            </Card>
            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 p-6">
              <Upload className="text-white mb-2" size={24} />
              <div className="text-3xl font-bold text-white">{analytics.summary.totalUploads}</div>
              <div className="text-orange-100 text-sm">Total Uploads</div>
            </Card>
          </div>

          <MRRChart data={analytics.mrrTrends} totalMRR={analytics.summary.totalMRR} mrrGrowth={analytics.summary.mrrGrowth} />
          
          <div className="grid md:grid-cols-2 gap-6">
            <TierDistributionChart data={analytics.tierDistribution} />
            <ConversionFunnelChart data={analytics.conversionFunnel} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ChurnRateChart data={analytics.churnTrends} avgChurnRate={analytics.summary.avgChurnRate} />
            <UploadPerformanceChart data={analytics.uploadPerformance} />
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionAnalytics;
