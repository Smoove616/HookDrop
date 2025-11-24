import { useState, useEffect } from 'react';
import { Bell, User, Star, DollarSign, CreditCard, Trash2, CheckCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  related_user_id?: string;
  related_hook_id?: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
    setLoading(false);
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user?.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'follower': return <User className="w-6 h-6 text-blue-500" />;
      case 'review': return <Star className="w-6 h-6 text-yellow-500" />;
      case 'purchase': return <CreditCard className="w-6 h-6 text-green-500" />;
      case 'payout': return <DollarSign className="w-6 h-6 text-purple-500" />;
      default: return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const followerNotifications = notifications.filter(n => n.type === 'follower');
  const purchaseNotifications = notifications.filter(n => n.type === 'purchase');
  const reviewNotifications = notifications.filter(n => n.type === 'review');

  const NotificationCard = ({ notif }: { notif: Notification }) => (
    <Card className={`p-4 mb-3 ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''}`}>
      <div className="flex gap-4">
        <div className="mt-1">{getIcon(notif.type)}</div>
        <div className="flex-1">
          <p className="text-sm mb-2">{notif.message}</p>
          <p className="text-xs text-gray-500">{getTimeAgo(notif.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {!notif.read && (
            <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)} title="Mark as read">
              <CheckCheck className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => deleteNotification(notif.id)} title="Delete">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400">{unreadNotifications.length} unread notifications</p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={markAllAsRead}>Mark All as Read</Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
            <TabsTrigger value="followers">Followers ({followerNotifications.length})</TabsTrigger>
            <TabsTrigger value="purchases">Sales ({purchaseNotifications.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviewNotifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? <p>Loading...</p> : notifications.length === 0 ? <p className="text-center text-gray-500 py-12">No notifications yet</p> : notifications.map(n => <NotificationCard key={n.id} notif={n} />)}
          </TabsContent>
          <TabsContent value="unread">
            {unreadNotifications.length === 0 ? <p className="text-center text-gray-500 py-12">No unread notifications</p> : unreadNotifications.map(n => <NotificationCard key={n.id} notif={n} />)}
          </TabsContent>
          <TabsContent value="followers">
            {followerNotifications.length === 0 ? <p className="text-center text-gray-500 py-12">No follower notifications</p> : followerNotifications.map(n => <NotificationCard key={n.id} notif={n} />)}
          </TabsContent>
          <TabsContent value="purchases">
            {purchaseNotifications.length === 0 ? <p className="text-center text-gray-500 py-12">No purchase notifications</p> : purchaseNotifications.map(n => <NotificationCard key={n.id} notif={n} />)}
          </TabsContent>
          <TabsContent value="reviews">
            {reviewNotifications.length === 0 ? <p className="text-center text-gray-500 py-12">No review notifications</p> : reviewNotifications.map(n => <NotificationCard key={n.id} notif={n} />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
