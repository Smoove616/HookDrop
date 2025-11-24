import { useEffect, useState } from 'react';
import { ReviewCard } from './ReviewCard';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ReviewListProps {
  hookId: string;
  hookUserId?: string;
}


export function ReviewList({ hookId, hookUserId }: ReviewListProps) {


  const [reviews, setReviews] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [hookId, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);
    
    let query = supabase
      .from('reviews')
      .select(`
        *,
        helpful_count:review_votes(count),
        not_helpful_count:review_votes(count)
      `)
      .eq('hook_id', hookId);

    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'highest') {
      query = query.order('rating', { ascending: false });
    } else if (sortBy === 'lowest') {
      query = query.order('rating', { ascending: true });
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-8">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="text-center py-8 text-gray-500">No reviews yet</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Customer Reviews ({reviews.length})</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="highest">Highest Rating</SelectItem>
            <SelectItem value="lowest">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            isVerifiedPurchase 
            hookSellerId={hookUserId}

          />
        ))}
      </div>
    </div>
  );
}

