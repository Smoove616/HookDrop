import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MRRChartProps {
  data: { month: string; mrr: number; proMrr: number; premiumMrr: number }[];
  totalMRR: number;
  mrrGrowth: number;
}

const MRRChart: React.FC<MRRChartProps> = ({ data, totalMRR, mrrGrowth }) => {
  return (
    <Card className="bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Monthly Recurring Revenue (MRR)</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">${totalMRR.toFixed(2)}</div>
          <div className={`flex items-center ${mrrGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {mrrGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="ml-1 text-sm">{Math.abs(mrrGrowth).toFixed(1)}% vs last month</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
          <Legend />
          <Line type="monotone" dataKey="mrr" stroke="#8b5cf6" name="Total MRR" strokeWidth={2} />
          <Line type="monotone" dataKey="proMrr" stroke="#3b82f6" name="Pro MRR" strokeWidth={2} />
          <Line type="monotone" dataKey="premiumMrr" stroke="#f59e0b" name="Premium MRR" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default MRRChart;
