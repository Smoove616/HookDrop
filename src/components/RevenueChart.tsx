import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface RevenueChartProps {
  data: any[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const grouped: any = {};
    data.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = { date, revenue: 0, sales: 0 };
      }
      grouped[date].revenue += parseFloat(item.amount);
      grouped[date].sales += 1;
    });
    return Object.values(grouped);
  }, [data]);

  const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const avgDaily = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  return (
    <Card className="bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-xl flex items-center">
            <TrendingUp className="mr-2 text-green-500" />
            Revenue Trends
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Total: ${totalRevenue.toFixed(2)} | Avg Daily: ${avgDaily.toFixed(2)}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue ($)" />
          <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} name="Sales" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;