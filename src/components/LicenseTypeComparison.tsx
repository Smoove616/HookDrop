import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileCheck } from 'lucide-react';

interface LicenseTypeComparisonProps {
  data: any[];
}

const LicenseTypeComparison: React.FC<LicenseTypeComparisonProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const stats = {
      exclusive: { sales: 0, revenue: 0 },
      'non-exclusive': { sales: 0, revenue: 0 }
    };
    
    data.forEach(item => {
      const type = item.license_type || 'non-exclusive';
      stats[type].sales += 1;
      stats[type].revenue += parseFloat(item.amount);
    });

    return [
      { type: 'Exclusive', sales: stats.exclusive.sales, revenue: stats.exclusive.revenue },
      { type: 'Non-Exclusive', sales: stats['non-exclusive'].sales, revenue: stats['non-exclusive'].revenue }
    ];
  }, [data]);

  return (
    <Card className="bg-gray-800 p-6">
      <h3 className="text-white font-bold text-xl flex items-center mb-4">
        <FileCheck className="mr-2 text-pink-500" />
        License Type Performance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="type" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="sales" fill="#EC4899" name="Sales" />
          <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue ($)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default LicenseTypeComparison;