import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Music, ShoppingBag, Star, Upload, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Activity {
  id: string;
  type: 'upload' | 'purchase' | 'sale' | 'review';
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

interface ActivityFeedProps {
  userId: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ userId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    const allActivities: Activity[] = [];

    // Fetch uploads
    const { data: uploads } = await supabase
      .from('hooks')
      .select('id, title, created_at')
      .eq('user_id', userId)

      .order('created_at', { ascending: false })
      .limit(5);

    uploads?.forEach(upload => {
      allActivities.push({
        id: `upload-${upload.id}`,
        type: 'upload',
        description: `Uploaded "${upload.title}"`,
        timestamp: upload.created_at,
        icon: <Upload size={16} />,
        color: 'text-blue-400'
      });
    });

    // Fetch purchases
    const { data: purchases } = await supabase
      .from('purchases')
      .select('id, created_at, hooks(title)')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    purchases?.forEach(purchase => {
      allActivities.push({
        id: `purchase-${purchase.id}`,
        type: 'purchase',
        description: `Purchased "${purchase.hooks?.title || 'a hook'}"`,
        timestamp: purchase.created_at,
        icon: <ShoppingBag size={16} />,
        color: 'text-green-400'
      });
    });

    // Fetch sales
    const { data: sales } = await supabase
      .from('earnings')
      .select('id, created_at, amount')
      .eq('user_id', userId)

      .order('created_at', { ascending: false })
      .limit(5);

    sales?.forEach(sale => {
      allActivities.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        description: `Made a sale for $${sale.amount}`,
        timestamp: sale.created_at,
        icon: <DollarSign size={16} />,
        color: 'text-yellow-400'
      });
    });

    // Sort all activities by timestamp
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(allActivities.slice(0, 10));
    setLoading(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <Card className="bg-gray-800 border-gray-700 p-6"><p className="text-gray-400">Loading activity...</p></Card>;
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h3 className="text-white font-bold text-lg mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
              <div className={`mt-1 ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.description}</p>
                <p className="text-gray-500 text-xs mt-1">{formatTimestamp(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
