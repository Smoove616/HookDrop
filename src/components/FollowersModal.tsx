import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import FollowButton from '@/components/FollowButton';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: 'followers' | 'following' | 'mutual';
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
}

export const FollowersModal: React.FC<FollowersModalProps> = ({ isOpen, onClose, userId, initialTab = 'followers' }) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [mutualFollowers, setMutualFollowers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchFollowers();
      fetchFollowing();
      fetchMutualFollowers();
    }
  }, [isOpen, userId]);

  const fetchFollowers = async () => {
    const { data } = await supabase
      .from('followers')
      .select('follower_id')
      .eq('following_id', userId);
    
    if (data) {
      const followerIds = data.map(f => f.follower_id);
      const { data: users } = await supabase.auth.admin.listUsers();
      setFollowers(users?.users.filter(u => followerIds.includes(u.id)).map(u => ({
        id: u.id,
        username: u.user_metadata?.username || 'User',
        email: u.email || '',
        bio: u.user_metadata?.bio
      })) || []);
    }
    setLoading(false);
  };

  const fetchFollowing = async () => {
    const { data } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', userId);
    
    if (data) {
      const followingIds = data.map(f => f.following_id);
      const { data: users } = await supabase.auth.admin.listUsers();
      setFollowing(users?.users.filter(u => followingIds.includes(u.id)).map(u => ({
        id: u.id,
        username: u.user_metadata?.username || 'User',
        email: u.email || '',
        bio: u.user_metadata?.bio
      })) || []);
    }
  };

  const fetchMutualFollowers = async () => {
    if (!user) return;
    const { data: myFollowing } = await supabase.from('followers').select('following_id').eq('follower_id', user.id);
    const { data: myFollowers } = await supabase.from('followers').select('follower_id').eq('following_id', user.id);
    
    const myFollowingIds = myFollowing?.map(f => f.following_id) || [];
    const myFollowerIds = myFollowers?.map(f => f.follower_id) || [];
    const mutualIds = myFollowingIds.filter(id => myFollowerIds.includes(id));
    
    const { data: users } = await supabase.auth.admin.listUsers();
    setMutualFollowers(users?.users.filter(u => mutualIds.includes(u.id)).map(u => ({
      id: u.id,
      username: u.user_metadata?.username || 'User',
      email: u.email || '',
      bio: u.user_metadata?.bio
    })) || []);
  };

  const UserCard = ({ userProfile }: { userProfile: UserProfile }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500">
          <AvatarFallback><User size={20} /></AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-white">{userProfile.username}</p>
          {userProfile.bio && <p className="text-sm text-gray-400 truncate max-w-[200px]">{userProfile.bio}</p>}
        </div>
      </div>
      {user?.id !== userProfile.id && <FollowButton userId={userProfile.id} />}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
            <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
            <TabsTrigger value="mutual">Mutual ({mutualFollowers.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="max-h-[400px] overflow-y-auto">
            {followers.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No followers yet</p>
            ) : (
              followers.map(f => <UserCard key={f.id} userProfile={f} />)
            )}
          </TabsContent>
          <TabsContent value="following" className="max-h-[400px] overflow-y-auto">
            {following.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Not following anyone yet</p>
            ) : (
              following.map(f => <UserCard key={f.id} userProfile={f} />)
            )}
          </TabsContent>
          <TabsContent value="mutual" className="max-h-[400px] overflow-y-auto">
            {mutualFollowers.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No mutual followers</p>
            ) : (
              mutualFollowers.map(f => <UserCard key={f.id} userProfile={f} />)
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
