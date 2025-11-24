import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, Award, Star, Zap } from 'lucide-react';

interface SocialProofBadgeProps {
  type: 'top_seller' | 'trending' | 'verified' | 'top_rated' | 'rising_star';
  className?: string;
}

export const SocialProofBadge: React.FC<SocialProofBadgeProps> = ({ type, className = '' }) => {
  const badges = {
    top_seller: {
      icon: <Crown size={12} />,
      label: 'Top Seller',
      className: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
    },
    trending: {
      icon: <TrendingUp size={12} />,
      label: 'Trending',
      className: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0'
    },
    verified: {
      icon: <Award size={12} />,
      label: 'Verified',
      className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0'
    },
    top_rated: {
      icon: <Star size={12} />,
      label: 'Top Rated',
      className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
    },
    rising_star: {
      icon: <Zap size={12} />,
      label: 'Rising Star',
      className: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0'
    }
  };

  const badge = badges[type];

  return (
    <Badge className={`${badge.className} ${className} flex items-center gap-1 px-2 py-1`}>
      {badge.icon}
      <span className="text-xs font-bold">{badge.label}</span>
    </Badge>
  );
};
