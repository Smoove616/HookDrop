import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface ChurnRateChartProps {
  data: { month: string; churnRate: number; canceledSubs: number }[];
  avgChurnRate: number;
}

const ChurnRateChart: React.FC<ChurnRateChartProps> = ({ data, avgChurnRate }) => {
  return (
    <Card className="bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Churn Rate</h3>
        <div className="flex items-center space-x-2">
          {avgChurnRate > 5 && <AlertTriangle className="text-yellow-500" size={20} />}
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{avgChurnRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Average</div>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
          <Area type="monotone" dataKey="churnRate" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ChurnRateChart;
