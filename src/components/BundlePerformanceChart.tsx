import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package } from 'lucide-react';

interface BundlePerformanceChartProps {
  data: any[];
}

const BundlePerformanceChart: React.FC<BundlePerformanceChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const grouped: any = {};
    data.forEach(item => {
      const name = item.bundles?.name || 'Unknown Bundle';
      if (!grouped[name]) {
        grouped[name] = { name, revenue: 0, sales: 0 };
      }
      grouped[name].revenue += parseFloat(item.amount);
      grouped[name].sales += 1;
    });
    return Object.values(grouped).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card className="bg-gray-800 p-6">
        <h3 className="text-white font-bold text-xl flex items-center mb-4">
          <Package className="mr-2 text-orange-500" />
          Bundle Performance
        </h3>
        <p className="text-gray-400 text-center py-8">No bundle sales in this period</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 p-6">
      <h3 className="text-white font-bold text-xl flex items-center mb-4">
        <Package className="mr-2 text-orange-500" />
        Bundle Performance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
          <Bar dataKey="revenue" fill="#F59E0B" name="Revenue ($)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BundlePerformanceChart;