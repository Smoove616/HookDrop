import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UploadPerformanceChartProps {
  data: {
    tier: string;
    uploads: number;
    avgUploadsPerUser: number;
    limitUtilization: number;
  }[];
}

const UploadPerformanceChart: React.FC<UploadPerformanceChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    tier: item.tier.charAt(0).toUpperCase() + item.tier.slice(1),
    uploads: item.uploads,
    avgPerUser: parseFloat(item.avgUploadsPerUser.toFixed(2)),
    utilization: parseFloat(item.limitUtilization.toFixed(1))
  }));

  return (
    <Card className="bg-gray-800 p-6">
      <h3 className="text-white font-bold text-lg mb-4">Upload Performance by Tier</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="tier" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
          <Legend />
          <Bar dataKey="uploads" fill="#8b5cf6" name="Total Uploads" />
          <Bar dataKey="avgPerUser" fill="#3b82f6" name="Avg per User" />
          <Bar dataKey="utilization" fill="#f59e0b" name="Limit Utilization %" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default UploadPerformanceChart;
