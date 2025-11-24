import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import HookAnalytics from './HookAnalytics';
import AnalyticsOverview from './AnalyticsOverview';
import { Lightbulb } from 'lucide-react';

interface AnalyticsTabProps {
  myHooks: any[];
  earnings: any[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ myHooks, earnings }) => {
  const analytics = useMemo(() => {
    const hookStats = myHooks.map(hook => {
      const hookEarnings = earnings.filter(e => e.purchases?.hook_id === hook.id);
      const purchases = hookEarnings.length;
      const revenue = hookEarnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      return { hook, purchases, revenue };
    });

    const totalViews = myHooks.reduce((sum, h) => sum + (h.views || 0), 0);
    const totalPlays = myHooks.reduce((sum, h) => sum + (h.plays || 0), 0);
    const totalSales = earnings.length;
    const totalRevenue = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const avgConversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

    return { hookStats, totalViews, totalPlays, totalSales, totalRevenue, avgConversionRate };
  }, [myHooks, earnings]);

  return (
    <div className="space-y-6">
      <AnalyticsOverview {...analytics} />

      <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-0 p-6">
        <div className="flex items-start space-x-4">
          <Lightbulb size={32} className="text-white flex-shrink-0" />
          <div className="text-white">
            <h3 className="font-bold text-lg mb-2">Insights & Tips</h3>
            <ul className="space-y-1 text-sm text-yellow-100">
              <li>• Hooks with higher play rates tend to convert better</li>
              <li>• Optimal pricing is typically between $15-$35 for most genres</li>
              <li>• Regular uploads help maintain visibility in the marketplace</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg">Hook Performance</h3>
        {analytics.hookStats.map(({ hook, purchases, revenue }) => (
          <HookAnalytics key={hook.id} hook={hook} purchases={purchases} revenue={revenue} />
        ))}
      </div>
    </div>
  );
};

export default AnalyticsTab;
