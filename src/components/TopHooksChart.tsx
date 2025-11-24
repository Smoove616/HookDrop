import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award } from 'lucide-react';

interface TopHooksChartProps {
  data: any[];
}

const TopHooksChart: React.FC<TopHooksChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const grouped: any = {};
    data.forEach(item => {
      const title = item.hooks?.title || 'Unknown';
      if (!grouped[title]) {
        grouped[title] = { title, revenue: 0, sales: 0 };
      }
      grouped[title].revenue += parseFloat(item.amount);
      grouped[title].sales += 1;
    });
    return Object.values(grouped)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [data]);

  return (
    <Card className="bg-gray-800 p-6">
      <h3 className="text-white font-bold text-xl flex items-center mb-4">
        <Award className="mr-2 text-yellow-500" />
        Top Selling Hooks
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="title" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
          <YAxis stroke="#9CA3AF" />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
          <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue ($)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TopHooksChart;