import { Badge } from './ui/badge';
import { Crown, Zap } from 'lucide-react';

interface TierBadgeProps {
  tier: string;
  className?: string;
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  if (tier === 'free') return null;

  const config = {
    pro: {
      label: 'Pro',
      icon: Zap,
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    premium: {
      label: 'Premium',
      icon: Crown,
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    },
  };

  const { label, icon: Icon, className: badgeClass } = config[tier as keyof typeof config] || config.pro;

  return (
    <Badge className={`${badgeClass} text-white ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
