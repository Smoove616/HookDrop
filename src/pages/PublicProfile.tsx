import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HookCard from '@/components/HookCard';
import { FollowButton } from '@/components/FollowButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Globe, Users, Music, DollarSign, Play, Star, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [hooks, setHooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    followers: 0,
    totalPlays: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    if (!username) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) {
        // Handle schema cache error gracefully
        if (profileError.message.includes('schema cache')) {
          setError('Profile system is loading. Please refresh the page in a moment.');
        } else {
          setError('Profile not found');
        }
        setLoading(false);
        return;
      }

      if (!profileData) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch user's hooks
      const { data: hooksData, error: hooksError } = await supabase
        .from('hooks')
        .select('*')
        .eq('user_id', profileData.id)

        .order('created_at', { ascending: false });
      
      // Handle hooks schema cache error gracefully
      if (hooksError && hooksError.message.includes('schema cache')) {
        console.error('Hooks schema cache error:', hooksError);
        setHooks([]);
      } else {
        setHooks(hooksData || []);
      }

      
      // Fetch stats
      // Fetch stats
      const { data: salesData } = await supabase
        .from('purchases')
        .select('amount')
        .eq('user_id', profileData.id)

        .eq('status', 'completed');
      
      const totalSales = salesData?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
      
      const { data: followersData } = await supabase
        .from('followers')
        .select('id')
        .eq('following_id', profileData.id);
      
      const totalPlays = hooksData?.reduce((sum, h) => sum + (h.plays || 0), 0) || 0;
      
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', profileData.id);

      
      const avgRating = reviewsData && reviewsData.length > 0
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
        : 0;
      
      setStats({
        totalSales,
        followers: followersData?.length || 0,
        totalPlays,
        averageRating: avgRating
      });
      
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };


  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${profile.full_name || profile.username}'s Profile`,
        text: `Check out ${profile.full_name || profile.username} on HookDrop!`,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Profile link copied to clipboard!'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <Card className="bg-gray-800 border-gray-700 p-8 text-center max-w-md">
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
              Go Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) return null;


  const isOwnProfile = currentUser?.id === profile.user_id;
  const avatarUrl = profile.avatar_url 
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl 
    : null;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">

        <Card className="bg-gray-800 border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl">
                {profile.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="text-gray-400">@{profile.username}</p>
                </div>
                <div className="flex gap-2">
                  {!isOwnProfile && profile.user_id && (
                    <FollowButton userId={profile.user_id} />
                  )}
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 size={16} className="mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              {profile.bio && (
                <p className="text-gray-300 mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                    <Globe size={16} />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 p-6">
            <Music className="text-white mb-2" size={28} />
            <h3 className="text-white text-2xl font-bold">{hooks.length}</h3>
            <p className="text-purple-200 text-sm">Hooks</p>
          </Card>
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 p-6">
            <Play className="text-white mb-2" size={28} />
            <h3 className="text-white text-2xl font-bold">{stats.totalPlays.toLocaleString()}</h3>
            <p className="text-blue-200 text-sm">Total Plays</p>
          </Card>
          <Card className="bg-gradient-to-br from-pink-600 to-pink-700 p-6">
            <Users className="text-white mb-2" size={28} />
            <h3 className="text-white text-2xl font-bold">{stats.followers}</h3>
            <p className="text-pink-200 text-sm">Followers</p>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6">
            <Star className="text-white mb-2" size={28} />
            <h3 className="text-white text-2xl font-bold">{stats.averageRating.toFixed(1)}</h3>
            <p className="text-yellow-200 text-sm">Avg Rating</p>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Uploaded Hooks</h2>
          {hooks.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 p-12 text-center">
              <Music size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No hooks uploaded yet</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hooks.map(hook => (
                <HookCard key={hook.id} hook={hook} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PublicProfile;
