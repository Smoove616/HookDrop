import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface ConversionFunnelChartProps {
  data: {
    freeUsers: number;
    freeToPro: number;
    freeToPremium: number;
    proToPremium: number;
    freeToProRate: number;
    freeToPremiumRate: number;
    proToPremiumRate: number;
  };
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ data }) => {
  return (
    <Card className="bg-gray-800 p-6">
      <h3 className="text-white font-bold text-lg mb-4">Conversion Funnel</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold">
              Free: {data.freeUsers}
            </div>
            <ArrowRight className="text-gray-400" size={20} />
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
              Pro: {data.freeToPro}
            </div>
          </div>
          <div className="text-green-400 font-bold">{data.freeToProRate.toFixed(1)}%</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold">
              Free: {data.freeUsers}
            </div>
            <ArrowRight className="text-gray-400" size={20} />
            <div className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold">
              Premium: {data.freeToPremium}
            </div>
          </div>
          <div className="text-green-400 font-bold">{data.freeToPremiumRate.toFixed(1)}%</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
              Pro: {data.freeToPro}
            </div>
            <ArrowRight className="text-gray-400" size={20} />
            <div className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold">
              Premium: {data.proToPremium}
            </div>
          </div>
          <div className="text-green-400 font-bold">{data.proToPremiumRate.toFixed(1)}%</div>
        </div>
      </div>
    </Card>
  );
};

export default ConversionFunnelChart;
