import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Flag, BadgeCheck, MessageSquare } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    review_text: string;
    created_at: string;
    buyer_id: string;
    hook_id: string;
    helpful_count?: number;
    not_helpful_count?: number;
  };
  isVerifiedPurchase?: boolean;
  hookSellerId?: string;
}

export function ReviewCard({ review, isVerifiedPurchase = true, hookSellerId }: ReviewCardProps) {
  const { user } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.not_helpful_count || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sellerResponse, setSellerResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isSeller = user?.id === hookSellerId;

  useEffect(() => {
    fetchSellerResponse();
  }, [review.id]);

  const fetchSellerResponse = async () => {
    const { data } = await supabase
      .from('review_responses')
      .select('*')
      .eq('review_id', review.id)
      .single();
    
    if (data) {
      setSellerResponse(data);
      setReplyText(data.response_text);
    }
  };

  const handleVote = async (isHelpful: boolean) => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    const { error } = await supabase.functions.invoke('vote-review', {
      body: { reviewId: review.id, userId: user.id, isHelpful }
    });

    if (error) {
      toast.error('Failed to vote');
    } else {
      if (isHelpful) setHelpfulCount(prev => prev + 1);
      else setNotHelpfulCount(prev => prev + 1);
      toast.success('Vote recorded');
    }
  };

  const handleReport = async () => {
    if (!user) return;
    const reason = prompt('Why are you reporting this review?');
    if (!reason) return;

    const { error } = await supabase.functions.invoke('report-review', {
      body: { reviewId: review.id, reporterId: user.id, reason }
    });

    if (error) toast.error('Failed to report');
    else toast.success('Review reported');
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setLoading(true);

    const { error } = await supabase.functions.invoke('respond-to-review', {
      body: { reviewId: review.id, responseText: replyText }
    });

    if (error) {
      toast.error('Failed to submit response');
    } else {
      toast.success('Response submitted');
      setShowReplyForm(false);
      fetchSellerResponse();
    }
    setLoading(false);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <RatingStars rating={review.rating} size="sm" />
          {isVerifiedPurchase && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <BadgeCheck className="w-4 h-4" />
              Verified Purchase
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>
      
      {review.review_text && (
        <p className="text-sm text-gray-700">{review.review_text}</p>
      )}

      <div className="flex items-center gap-4 pt-2">
        <Button variant="ghost" size="sm" onClick={() => handleVote(true)}>
          <ThumbsUp className="w-4 h-4 mr-1" />
          Helpful ({helpfulCount})
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleVote(false)}>
          <ThumbsDown className="w-4 h-4 mr-1" />
          Not Helpful ({notHelpfulCount})
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReport}>
          <Flag className="w-4 h-4 mr-1" />
          Report
        </Button>
        {isSeller && !showReplyForm && (
          <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(true)}>
            <MessageSquare className="w-4 h-4 mr-1" />
            {sellerResponse ? 'Edit Reply' : 'Reply'}
          </Button>
        )}
      </div>

      {showReplyForm && isSeller && (
        <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your response..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmitReply} disabled={loading} size="sm">
              Submit Response
            </Button>
            <Button variant="outline" onClick={() => setShowReplyForm(false)} size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {sellerResponse && !showReplyForm && (
        <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600">Seller Response</span>
          </div>
          <p className="text-sm text-gray-700">{sellerResponse.response_text}</p>
          <span className="text-xs text-gray-500 mt-1 block">
            {new Date(sellerResponse.created_at).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
