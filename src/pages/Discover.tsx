import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Users, Sparkles } from 'lucide-react';
import ProducerCard from '@/components/ProducerCard';
import HookCard from '@/components/HookCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const Discover: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [producers, setProducers] = useState<any[]>([]);
  const [trendingHooks, setTrendingHooks] = useState<any[]>([]);
  const { user } = useAuth();

  const genres = ['all', 'Hip Hop', 'R&B', 'Pop', 'Electronic', 'Rock', 'Jazz', 'Country'];

  // Mock data for producers

  const mockProducers = [
    {
      id: '1',
      name: 'DJ Rhythm',
      avatar: 'https://d64gsuwffb70l.cloudfront.net/6899e81315e97aaa3006c598_1759815300575_f219527b.webp',
      genre: 'Hip Hop',
      hookCount: 45,
      followerCount: 1250,
    },
    {
      id: '2',
      name: 'SynthWave',
      avatar: 'https://d64gsuwffb70l.cloudfront.net/6899e81315e97aaa3006c598_1759815302633_cc0ba79c.webp',
      genre: 'Electronic',
      hookCount: 38,
      followerCount: 980,
    },
    {
      id: '3',
      name: 'BeatMaster',
      avatar: 'https://d64gsuwffb70l.cloudfront.net/6899e81315e97aaa3006c598_1759815304340_a029634e.webp',
      genre: 'R&B',
      hookCount: 52,
      followerCount: 1580,
    },
    {
      id: '4',
      name: 'PopKing',
      avatar: 'https://d64gsuwffb70l.cloudfront.net/6899e81315e97aaa3006c598_1759815306047_3f6af1b6.webp',
      genre: 'Pop',
      hookCount: 67,
      followerCount: 2100,
    },
    {
      id: '5',
      name: 'RockSolid',
      avatar: 'https://d64gsuwffb70l.cloudfront.net/6899e81315e97aaa3006c598_1759815307874_d2732111.webp',
      genre: 'Rock',
      hookCount: 41,
      followerCount: 890,
    },
    {
      id: '6',
      name: 'JazzMaestro',
      avatar: 'https://d64gsuwffb70l.cloudfront.net/6899e81315e97aaa3006c598_1759815309607_5f01ad2e.webp',
      genre: 'Jazz',
      hookCount: 33,
      followerCount: 720,
    },
  ];


  useEffect(() => {
    loadData();
  }, [selectedGenre, searchQuery]);

  const loadData = async () => {
    // Load real hooks from database
    let query = supabase
      .from('hooks')
      .select('*, profiles(username, avatar_url)')
      .eq('status', 'active');

    if (selectedGenre !== 'all') {
      query = query.eq('genre', selectedGenre);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,artist_name.ilike.%${searchQuery}%`);
    }

    const { data: hooksData } = await query.order('created_at', { ascending: false }).limit(12);
    setTrendingHooks(hooksData || []);

    // Filter mock producers
    let filtered = mockProducers;
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(p => p.genre === selectedGenre);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setProducers(filtered);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 pb-24">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="text-purple-400 w-8 h-8 sm:w-10 sm:h-10" />
            Discover
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Find and follow talented producers</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search producers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white h-12 text-base"
            />
          </div>
          
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700 text-white h-12">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


        <Tabs defaultValue="producers" className="w-full">
          <TabsList className="bg-gray-800 border-gray-700 mb-6 w-full grid grid-cols-2 h-auto">
            <TabsTrigger value="producers" className="data-[state=active]:bg-purple-600 h-12 text-sm sm:text-base">
              <Users size={16} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Popular </span>Producers
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600 h-12 text-sm sm:text-base">
              <TrendingUp size={16} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Trending </span>Hooks
            </TabsTrigger>
          </TabsList>


          <TabsContent value="producers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {producers.map((producer) => (
                <ProducerCard key={producer.id} {...producer} />
              ))}
            </div>
            
            {producers.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No producers found. Try adjusting your filters.
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingHooks.map((hook) => (
                <HookCard key={hook.id} hook={hook} />
              ))}
            </div>
            
            {trendingHooks.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No hooks found. Try adjusting your filters.
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Discover;
