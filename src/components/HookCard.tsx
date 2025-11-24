import React, { useState, useEffect } from 'react';
import { Heart, Play, Pause, ListPlus, ShoppingCart as ShoppingCartIcon, Shield, MessageSquare, Layers } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialShare } from './SocialShare';
import { SocialProofBadge } from './SocialProofBadge';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import LicenseModal from './LicenseModal';
import { RatingStars } from './RatingStars';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';





interface Hook {
  id: string;
  title: string;
  seller_name: string;
  genre: string;
  bpm: number;
  key: string;
  price: number;
  audio_url: string;
  preview_url?: string;
  preview_generated?: boolean;
  likes: number;
  plays: number;
  user_id: string;

  license_type?: string;
  exclusive_price?: number;
  non_exclusive_price?: number;
  license_terms?: string;
  seller_badge?: 'top_seller' | 'trending' | 'verified' | 'top_rated' | 'rising_star';
}



interface HookCardProps {
  hook: Hook;
}

const HookCard: React.FC<HookCardProps> = ({ hook }) => {
  const { playHook, addToPlaylist, currentHook, isPlaying: globalIsPlaying } = useAudio();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(hook.likes);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [versionCount, setVersionCount] = useState(0);

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to add items to cart", variant: "destructive" });
      return;
    }
    const licenseType = hook.license_type === 'exclusive' ? 'exclusive' : 'non_exclusive';
    const price = licenseType === 'exclusive' ? hook.exclusive_price : hook.non_exclusive_price || hook.price;
    addToCart({
      hookId: hook.id,
      hookTitle: hook.title,
      artistName: hook.seller_name,
      price: price,
      licenseType: licenseType,
      sellerId: hook.user_id,
      imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${hook.id}`
    });
    toast({ title: "Added to Cart", description: `${hook.title} added to your cart` });
  };


  useEffect(() => {
    fetchReviewStats();
    fetchVersionCount();
  }, [hook.id]);

  const fetchVersionCount = async () => {
    const { count } = await supabase
      .from('hook_versions')
      .select('*', { count: 'exact', head: true })
      .eq('hook_id', hook.id)
      .eq('is_active', true);
    
    if (count) setVersionCount(count);
  };


  useEffect(() => {
    fetchReviewStats();
  }, [hook.id]);

  const fetchReviewStats = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('hook_id', hook.id);

    if (!error && data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      setAvgRating(avg);
      setReviewCount(data.length);
    }
  };

  const isCurrentlyPlaying = currentHook?.id === parseInt(hook.id) && globalIsPlaying;

  const handlePlay = () => {
    // Use preview URL if available and user hasn't purchased, otherwise use full audio
    const audioUrl = hook.preview_url && hook.preview_generated ? hook.preview_url : hook.audio_url;
    
    playHook({
      id: parseInt(hook.id),
      title: hook.title,
      artist: hook.seller_name,
      price: hook.price,
      genre: hook.genre,
      bpm: hook.bpm,
      duration: '30',
      image: `https://api.dicebear.com/7.x/shapes/svg?seed=${hook.id}`,
      audioUrl: audioUrl
    });
  };

  const handleAddToPlaylist = () => {
    const audioUrl = hook.preview_url && hook.preview_generated ? hook.preview_url : hook.audio_url;
    
    addToPlaylist({
      id: parseInt(hook.id),
      title: hook.title,
      artist: hook.seller_name,
      price: hook.price,
      genre: hook.genre,
      bpm: hook.bpm,
      duration: '30',
      image: `https://api.dicebear.com/7.x/shapes/svg?seed=${hook.id}`,
      audioUrl: audioUrl
    });
  };


  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase hooks",
        variant: "destructive"
      });
      return;
    }

    if (hook.license_type === 'both') {
      setShowLicenseModal(true);
    } else {
      purchaseHook(hook.license_type || 'non_exclusive');
    }
  };

  const purchaseHook = async (licenseType: string) => {
    try {
      const price = licenseType === 'exclusive' ? hook.exclusive_price : hook.non_exclusive_price;
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          hookId: hook.id,
          hookTitle: hook.title,
          price: price,
          sellerId: hook.user_id,

          licenseType: licenseType
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to initiate purchase",
        variant: "destructive"
      });
    }
  };

  const displayPrice = hook.license_type === 'exclusive' 
    ? hook.exclusive_price 
    : hook.non_exclusive_price || hook.price;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlay}
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white hover:from-purple-600 hover:to-pink-600 flex-shrink-0"
            >
              {isCurrentlyPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{hook.title}</h3>
                {hook.seller_badge && <SocialProofBadge type={hook.seller_badge} />}
              </div>
              <p className="text-gray-600 text-xs sm:text-sm truncate">by {hook.seller_name}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className="font-bold text-green-600 text-base sm:text-lg">${displayPrice}</p>
            <p className="text-xs text-gray-500">{hook.bpm} BPM</p>
          </div>
        </div>



        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">{hook.genre}</Badge>
          <Badge variant="outline" className="text-xs">{hook.key}</Badge>
          {versionCount > 0 && (
            <Badge variant="default" className="text-xs bg-blue-500">
              <Layers size={10} className="mr-1" />
              {versionCount} Versions
            </Badge>
          )}
          {hook.license_type === 'both' && (
            <Badge variant="default" className="text-xs bg-purple-500">
              <Shield size={10} className="mr-1" />
              Multiple Licenses
            </Badge>
          )}
          {hook.license_type === 'exclusive' && (
            <Badge variant="default" className="text-xs bg-amber-500">
              <Shield size={10} className="mr-1" />
              Exclusive Only
            </Badge>
          )}
        </div>


        {reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-3 pt-2 border-t">
            <RatingStars rating={avgRating} size="sm" showNumber />
            <button 
              onClick={() => setShowReviewModal(true)}
              className="text-xs text-gray-600 hover:text-purple-600 flex items-center gap-1"
            >
              <MessageSquare size={12} />
              ({reviewCount} reviews)
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={toggleLike}
              className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              <span className="text-sm">{likeCount}</span>
            </button>
            <button 
              onClick={handleAddToPlaylist}
              className="flex items-center space-x-1 text-gray-500 hover:text-purple-500 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center"
            >
              <ListPlus size={18} />
            </button>
          </div>
          <Button 
            size="sm" 
            onClick={handleBuyNow}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-11 sm:h-9 px-4"
          >
            <ShoppingCartIcon size={16} className="mr-1" />

            <span className="hidden sm:inline">Buy Now</span>
            <span className="sm:hidden">Buy</span>
          </Button>
        </div>

      </div>

      {showLicenseModal && (
        <LicenseModal
          isOpen={showLicenseModal}
          onClose={() => setShowLicenseModal(false)}
          hook={hook}
          onSelectLicense={purchaseHook}
        />
      )}

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{hook.title} - Reviews</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <ReviewForm hookId={hook.id} onSuccess={fetchReviewStats} />
            <ReviewList hookId={hook.id} hookUserId={hook.user_id} />


          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HookCard;
