import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!user || user.email_confirmed_at || isDismissed) return null;

  const handleResendVerification = async () => {
    setIsSending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!
      });

      if (error) throw error;

      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Alert className="bg-yellow-500/10 border-yellow-500/50 mb-4 mx-4 mt-4">
      <Mail className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-yellow-200">
          Please verify your email address to access all features.
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResendVerification}
            disabled={isSending}
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
          >
            {isSending ? 'Sending...' : 'Resend Email'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="text-yellow-500 hover:bg-yellow-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
