import { useState } from 'react';
import { RatingStars } from './RatingStars';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReviewFormProps {
  hookId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ hookId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setSubmitting(true);
    const { error } = await supabase.functions.invoke('submit-review', {
      body: {
        hookId,
        buyerId: user.id,
        rating,
        reviewText
      }
    });

    setSubmitting(false);

    if (error) {
      toast.error('Failed to submit review');
    } else {
      toast.success('Review submitted successfully');
      setRating(0);
      setReviewText('');
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Write a Review</h3>
      
      <div>
        <label className="text-sm text-gray-600 mb-2 block">Your Rating</label>
        <RatingStars rating={rating} interactive onRate={setRating} size="lg" />
      </div>

      <div>
        <label className="text-sm text-gray-600 mb-2 block">Your Review (Optional)</label>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this hook..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={rating === 0 || submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
