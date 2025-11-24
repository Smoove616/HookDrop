import { Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const plans = [
  {
    name: 'Free',
    price: '$0',
    priceId: null,
    tier: 'free',
    features: ['3 uploads per month', '10% platform fee', 'Basic analytics', 'Community support'],
  },
  {
    name: 'Pro',
    price: '$9.99',
    priceId: 'price_pro_monthly',
    tier: 'pro',
    popular: true,
    features: ['10 uploads per month', '7% platform fee', 'Advanced analytics', 'Priority support', 'Pro badge'],
  },
  {
    name: 'Premium',
    price: '$29.99',
    priceId: 'price_premium_monthly',
    tier: 'premium',
    features: ['Unlimited uploads', '5% platform fee', 'Advanced analytics', 'Priority support', 'Premium badge', 'Early access to features'],
  },
];

export function SubscriptionPlans({ currentTier = 'free' }: { currentTier?: string }) {
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string | null) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    if (!priceId) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { priceId, userId: user.id, userEmail: user.email },
      });

      if (error) throw error;
      if (data.url) window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to create subscription');
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card key={plan.tier} className={`p-6 relative ${plan.popular ? 'border-purple-500 border-2' : ''}`}>
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">Most Popular</Badge>
          )}
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold">{plan.price}</span>
            {plan.priceId && <span className="text-muted-foreground">/month</span>}
          </div>
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            onClick={() => handleSubscribe(plan.priceId)}
            disabled={currentTier === plan.tier || !plan.priceId}
            className="w-full"
            variant={plan.popular ? 'default' : 'outline'}
          >
            {currentTier === plan.tier ? 'Current Plan' : plan.priceId ? 'Subscribe' : 'Current Plan'}
          </Button>
        </Card>
      ))}
    </div>
  );
}
