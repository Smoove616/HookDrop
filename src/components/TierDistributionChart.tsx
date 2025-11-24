import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TierDistributionChartProps {
  data: { tier: string; count: number; percentage: number }[];
}

const COLORS = {
  free: '#6b7280',
  pro: '#3b82f6',
  premium: '#f59e0b'
};

const TierDistributionChart: React.FC<TierDistributionChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.tier.charAt(0).toUpperCase() + item.tier.slice(1),
    value: item.count,
    percentage: item.percentage
  }));

  return (
    <Card className="bg-gray-800 p-6">
      <h3 className="text-white font-bold text-lg mb-4">Subscription Tier Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TierDistributionChart;
