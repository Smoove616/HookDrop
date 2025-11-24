import React, { useState, useEffect } from 'react';
import { Filter, TrendingUp, Clock, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HookCard from './HookCard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';


interface Hook {
  id: string;
  title: string;
  seller_name: string;
  genre: string;
  bpm: number;
  key: string;
  price: number;
  audio_url: string;
  likes: number;
  plays: number;
  created_at: string;
  user_id: string;
}


const MarketplaceFeed: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('recent');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHooks();
  }, [activeFilter, selectedGenre]);

  const fetchHooks = async () => {
    setLoading(true);
    
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Using sample data.');
        setHooks(getSampleHooks());
        setLoading(false);
        return;
      }

      if (activeFilter === 'top-rated') {
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('hook_id, rating');
        
        if (reviewError) throw reviewError;
        
        if (reviewData) {
          const ratingMap = new Map();
          reviewData.forEach(review => {
            if (!ratingMap.has(review.hook_id)) {
              ratingMap.set(review.hook_id, []);
            }
            ratingMap.get(review.hook_id).push(review.rating);
          });

          const avgRatings = Array.from(ratingMap.entries()).map(([hookId, ratings]) => ({
            hookId,
            avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length
          })).sort((a, b) => b.avgRating - a.avgRating);

          const topHookIds = avgRatings.slice(0, 50).map(r => r.hookId);
          if (topHookIds.length > 0) {
            const { data: hooksData, error: hooksError } = await supabase
              .from('hooks')
              .select('*')
              .eq('is_available', true)
              .in('id', topHookIds);
            
            if (hooksError) throw hooksError;
            setHooks(hooksData || []);
          }
        }
      } else {
        let query = supabase.from('hooks').select('*').eq('is_available', true);

        if (selectedGenre !== 'All') {
          query = query.eq('genre', selectedGenre);
        }

        if (activeFilter === 'recent') {
          query = query.order('created_at', { ascending: false });
        } else if (activeFilter === 'popular') {
          query = query.order('likes', { ascending: false });
        } else if (activeFilter === 'trending') {
          query = query.order('plays', { ascending: false });
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;
        setHooks(data || []);
      }
    } catch (error) {
      console.warn('Error fetching hooks. Using sample data.', error);
      setHooks(getSampleHooks());
    }
    setLoading(false);
  };


  const getSampleHooks = (): Hook[] => {
    return [
      { id: '1', title: 'Midnight Vibes', seller_name: 'DJ Nova', genre: 'Hip-Hop', bpm: 140, key: 'Am', price: 29.99, audio_url: '', likes: 234, plays: 1523, created_at: new Date().toISOString(), user_id: 'sample' },
      { id: '2', title: 'Summer Dreams', seller_name: 'Producer X', genre: 'Pop', bpm: 128, key: 'C', price: 24.99, audio_url: '', likes: 189, plays: 987, created_at: new Date().toISOString(), user_id: 'sample' },
      { id: '3', title: 'Bass Drop', seller_name: 'BeatMaker', genre: 'Trap', bpm: 150, key: 'Dm', price: 34.99, audio_url: '', likes: 456, plays: 2341, created_at: new Date().toISOString(), user_id: 'sample' },
      { id: '4', title: 'Chill Wave', seller_name: 'Lofi King', genre: 'Ambient', bpm: 90, key: 'G', price: 19.99, audio_url: '', likes: 321, plays: 1876, created_at: new Date().toISOString(), user_id: 'sample' },
      { id: '5', title: 'Electric Soul', seller_name: 'Synth Master', genre: 'Electronic', bpm: 125, key: 'Em', price: 27.99, audio_url: '', likes: 278, plays: 1432, created_at: new Date().toISOString(), user_id: 'sample' },
      { id: '6', title: 'Urban Nights', seller_name: 'City Beats', genre: 'Hip-Hop', bpm: 135, key: 'Bm', price: 32.99, audio_url: '', likes: 412, plays: 2109, created_at: new Date().toISOString(), user_id: 'sample' },
    ];
  };





  const filterOptions = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'popular', label: 'Popular', icon: Heart },
    { id: 'top-rated', label: 'Top Rated', icon: Star },
  ];


  const genres = ['All', 'Hip-Hop', 'Electronic', 'Pop', 'R&B', 'Rock', 'Trap', 'Ambient'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Discover Hooks</h2>
          <p className="text-gray-300">Find the perfect hook for your next hit</p>
        </div>
        
        <div className="flex space-x-1">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.id}
                variant={activeFilter === option.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(option.id)}
                className={activeFilter === option.id 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'text-gray-300 hover:text-purple-400 hover:bg-gray-800'
                }
              >
                <Icon size={16} className="mr-1" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {genres.map((genre) => (
          <Badge
            key={genre}
            variant={genre === selectedGenre ? 'default' : 'secondary'}
            className={`cursor-pointer ${
              genre === selectedGenre 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedGenre(genre)}
          >
            {genre}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading hooks...</div>
      ) : hooks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No hooks found. Be the first to upload!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hooks.map((hook) => (
            <HookCard key={hook.id} hook={hook} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceFeed;
