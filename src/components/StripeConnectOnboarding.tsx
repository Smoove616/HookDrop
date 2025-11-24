import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface StripeConnectOnboardingProps {
  isConnected: boolean;
  onboardingCompleted: boolean;
  chargesEnabled: boolean;
  onRefresh: () => void;
}

export const StripeConnectOnboarding: React.FC<StripeConnectOnboardingProps> = ({
  isConnected,
  onboardingCompleted,
  chargesEnabled,
  onRefresh
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to start Stripe Connect onboarding",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleContinue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('continue-stripe-onboarding');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to continue Stripe onboarding",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isConnected && onboardingCompleted && chargesEnabled) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-start gap-4">
          <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-1">Stripe Connected</h3>
            <p className="text-sm text-green-700 mb-3">
              Your Stripe account is connected and ready to receive payments.
            </p>
            <Button onClick={onRefresh} variant="outline" size="sm">
              Refresh Status
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Account exists but onboarding not complete
  if (isConnected && !onboardingCompleted) {
    return (
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="font-semibold text-yellow-900 mb-2">Complete Your Stripe Setup</h3>
        <p className="text-sm text-yellow-700 mb-4">
          Your Stripe account setup is incomplete. Click below to continue where you left off.
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={handleContinue} 
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Continue Setup
              </>
            )}
          </Button>
          <Button onClick={onRefresh} variant="outline" size="sm">
            Refresh Status
          </Button>
        </div>
      </Card>
    );
  }


  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-2">Connect Stripe to Receive Payments</h3>
      <p className="text-sm text-blue-700 mb-4">
        Connect your Stripe account to receive payments directly from hook sales. 
        We charge a 10% platform fee on each sale.
      </p>
      <Button 
        onClick={handleConnect} 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <ExternalLink className="mr-2 h-4 w-4" />
            Connect Stripe Account
          </>
        )}
      </Button>
    </Card>
  );
};
