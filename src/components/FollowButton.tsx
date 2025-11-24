import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: () => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ userId, onFollowChange }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [userId, user]);

  const checkFollowStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();
    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('follow-user', {
        body: { following_id: userId, action: isFollowing ? 'unfollow' : 'follow' }
      });
      if (error) throw error;
      setIsFollowing(!isFollowing);
      onFollowChange?.();
      toast({ title: isFollowing ? 'Unfollowed' : 'Following!' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === userId) return null;

  return (
    <Button onClick={handleFollow} disabled={loading} variant={isFollowing ? 'outline' : 'default'}>
      {isFollowing ? <UserMinus className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
