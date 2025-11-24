import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Eye, Play, DollarSign, ShoppingCart } from 'lucide-react';

interface HookAnalyticsProps {
  hook: any;
  purchases: number;
  revenue: number;
}

const HookAnalytics: React.FC<HookAnalyticsProps> = ({ hook, purchases, revenue }) => {
  const views = hook.views || 0;
  const plays = hook.plays || 0;
  const conversionRate = views > 0 ? ((purchases / views) * 100).toFixed(2) : '0.00';
  const playRate = views > 0 ? ((plays / views) * 100).toFixed(2) : '0.00';

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">{hook.title}</h3>
          <p className="text-gray-400 text-sm">{hook.genre} • ${hook.price}</p>
        </div>
        <div className="text-right">
          <p className="text-green-400 font-bold text-xl">${revenue.toFixed(2)}</p>
          <p className="text-gray-400 text-xs">Total Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gray-700 rounded-lg p-3">
          <Eye size={20} className="text-blue-400 mb-1" />
          <p className="text-white font-bold text-lg">{views}</p>
          <p className="text-gray-400 text-xs">Views</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <Play size={20} className="text-purple-400 mb-1" />
          <p className="text-white font-bold text-lg">{plays}</p>
          <p className="text-gray-400 text-xs">Plays</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <ShoppingCart size={20} className="text-green-400 mb-1" />
          <p className="text-white font-bold text-lg">{purchases}</p>
          <p className="text-gray-400 text-xs">Sales</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <TrendingUp size={20} className="text-yellow-400 mb-1" />
          <p className="text-white font-bold text-lg">{conversionRate}%</p>
          <p className="text-gray-400 text-xs">Conversion</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <DollarSign size={20} className="text-pink-400 mb-1" />
          <p className="text-white font-bold text-lg">${(revenue / (purchases || 1)).toFixed(2)}</p>
          <p className="text-gray-400 text-xs">Avg Sale</p>
        </div>
      </div>
    </Card>
  );
};

export default HookAnalytics;
