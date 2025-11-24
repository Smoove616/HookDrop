import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Eye, Play, ShoppingCart, DollarSign, Percent } from 'lucide-react';

interface AnalyticsOverviewProps {
  totalViews: number;
  totalPlays: number;
  totalSales: number;
  totalRevenue: number;
  avgConversionRate: number;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  totalViews,
  totalPlays,
  totalSales,
  totalRevenue,
  avgConversionRate
}) => {
  const playRate = totalViews > 0 ? ((totalPlays / totalViews) * 100).toFixed(1) : '0.0';
  const avgRevenuePerSale = totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-600 to-blue-700 p-4">
        <Eye className="text-white mb-2" size={28} />
        <h3 className="text-white text-2xl font-bold">{totalViews}</h3>
        <p className="text-blue-200 text-sm">Total Views</p>
      </Card>
      <Card className="bg-gradient-to-br from-purple-600 to-purple-700 p-4">
        <Play className="text-white mb-2" size={28} />
        <h3 className="text-white text-2xl font-bold">{totalPlays}</h3>
        <p className="text-purple-200 text-sm">Total Plays</p>
      </Card>
      <Card className="bg-gradient-to-br from-green-600 to-green-700 p-4">
        <ShoppingCart className="text-white mb-2" size={28} />
        <h3 className="text-white text-2xl font-bold">{totalSales}</h3>
        <p className="text-green-200 text-sm">Total Sales</p>
      </Card>
      <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-4">
        <DollarSign className="text-white mb-2" size={28} />
        <h3 className="text-white text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
        <p className="text-yellow-200 text-sm">Revenue</p>
      </Card>
      <Card className="bg-gradient-to-br from-pink-600 to-pink-700 p-4">
        <Percent className="text-white mb-2" size={28} />
        <h3 className="text-white text-2xl font-bold">{avgConversionRate.toFixed(2)}%</h3>
        <p className="text-pink-200 text-sm">Conversion</p>
      </Card>
      <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4">
        <TrendingUp className="text-white mb-2" size={28} />
        <h3 className="text-white text-2xl font-bold">${avgRevenuePerSale}</h3>
        <p className="text-indigo-200 text-sm">Avg Sale</p>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;
