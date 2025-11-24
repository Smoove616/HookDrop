import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Plus, Trash2, ArrowUpDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Activity {
  id: string;
  action: string;
  user_id: string;
  username: string;
  hook_title?: string;
  created_at: string;
}

interface PlaylistActivityFeedProps {
  playlistId: string;
}

export function PlaylistActivityFeed({ playlistId }: PlaylistActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
    
    const channel = supabase
      .channel(`playlist-activity:${playlistId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'playlist_activity',
        filter: `playlist_id=eq.${playlistId}`
      }, (payload) => {
        const newActivity = payload.new as Activity;
        setActivities(prev => [newActivity, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [playlistId]);

  const loadActivities = async () => {
    const { data } = await supabase
      .from('playlist_activity')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setActivities(data);
  };

  const getIcon = (action: string) => {
    if (action.includes('added')) return <Plus className="h-3 w-3" />;
    if (action.includes('removed')) return <Trash2 className="h-3 w-3" />;
    if (action.includes('reordered')) return <ArrowUpDown className="h-3 w-3" />;
    return <Bell className="h-3 w-3" />;
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (activities.length === 0) return null;

  return (
    <ScrollArea className="h-48 border rounded-lg p-3">
      <div className="space-y-2">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-2 text-xs">
            <div className="mt-0.5 text-muted-foreground">{getIcon(activity.action)}</div>
            <div className="flex-1">
              <span className="font-medium">{activity.username}</span>
              <span className="text-muted-foreground"> {activity.action}</span>
              <span className="text-muted-foreground block">{getTimeAgo(activity.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
