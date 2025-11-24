import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import RevenueChart from './RevenueChart';
import TopHooksChart from './TopHooksChart';
import GeographicChart from './GeographicChart';
import BundlePerformanceChart from './BundlePerformanceChart';
import LicenseTypeComparison from './LicenseTypeComparison';

const AdvancedAnalytics: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-advanced-analytics', {
        body: { startDate, endDate }
      });
      if (error) throw error;
      setAnalytics(data);
    } catch (error: any) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const exportPDF = () => {
    window.print();
    toast.success('Print dialog opened - save as PDF');
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
          <Button onClick={fetchAnalytics} disabled={loading}><Calendar className="mr-2" size={16} />Apply Filter</Button>
          <Button onClick={exportPDF} variant="outline"><Download className="mr-2" size={16} />Export PDF</Button>
        </div>
      </Card>

      {analytics && (
        <>
          <RevenueChart data={analytics.revenueTrends} />
          <div className="grid md:grid-cols-2 gap-6">
            <TopHooksChart data={analytics.topHooks} />
            <GeographicChart data={analytics.geoData} />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <BundlePerformanceChart data={analytics.bundleData} />
            <LicenseTypeComparison data={analytics.revenueTrends} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedAnalytics;