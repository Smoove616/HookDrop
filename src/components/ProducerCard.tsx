import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, MessageCircle } from 'lucide-react';
import FollowButton from './FollowButton';
import { SocialProofBadge } from './SocialProofBadge';
import { MessagingPanel } from './MessagingPanel';

interface ProducerCardProps {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  genre: string;
  hookCount: number;
  followerCount: number;
  badge?: 'top_seller' | 'trending' | 'verified' | 'top_rated' | 'rising_star';
}

const ProducerCard: React.FC<ProducerCardProps> = ({
  id,
  name,
  username,
  avatar,
  genre,
  hookCount,
  followerCount,
  badge
}) => {
  const navigate = useNavigate();
  const [showMessaging, setShowMessaging] = useState(false);


  return (
    <>
      <Card className="bg-gray-800 border-gray-700 p-6 hover:border-purple-500 transition-all">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            {badge && <SocialProofBadge type={badge} />}
          </div>
          <Badge variant="secondary" className="mb-3">{genre}</Badge>
          
          <div className="flex gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Music size={14} />
              <span>{hookCount} hooks</span>
            </div>
            <div>
              <span>{followerCount} followers</span>
            </div>
          </div>
          
          <div className="flex gap-2 w-full">
            <FollowButton userId={id} />
            <Button onClick={() => setShowMessaging(true)} variant="outline" size="sm" className="flex-1">
              <MessageCircle size={14} className="mr-1" />
              Message
            </Button>
          </div>
        </div>
      </Card>
      {showMessaging && <MessagingPanel recipientId={id} recipientName={name} onClose={() => setShowMessaging(false)} />}
    </>
  );
};


export default ProducerCard;
