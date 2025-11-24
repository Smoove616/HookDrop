import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Globe } from 'lucide-react';

interface GeographicChartProps {
  data: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const GeographicChart: React.FC<GeographicChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const domains: any = {};
    data.forEach(item => {
      const domain = item.buyer_email?.split('@')[1] || 'unknown';
      domains[domain] = (domains[domain] || 0) + 1;
    });
    return Object.entries(domains)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 6);
  }, [data]);

  return (
    <Card className="bg-gray-800 p-6">
      <h3 className="text-white font-bold text-xl flex items-center mb-4">
        <Globe className="mr-2 text-blue-500" />
        Buyer Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default GeographicChart;