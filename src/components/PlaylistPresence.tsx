import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface PresenceUser {
  user_id: string;
  username: string;
  presence_ref: string;
}

interface PlaylistPresenceProps {
  playlistId: string;
  currentUserId: string;
}

export function PlaylistPresence({ playlistId, currentUserId }: PlaylistPresenceProps) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`playlist:${playlistId}`, {
      config: { presence: { key: currentUserId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((presence) => {
            if (presence.user_id !== currentUserId) {
              users.push(presence);
            }
          });
        });
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
              online_at: new Date().toISOString()
            });
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [playlistId, currentUserId]);

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 3).map((user) => (
          <Avatar key={user.presence_ref} className="h-6 w-6 border-2 border-background">
            <AvatarFallback className="text-xs bg-green-500 text-white">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
        {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} viewing
      </span>
    </div>
  );
}
