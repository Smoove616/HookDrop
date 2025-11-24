import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Bell } from 'lucide-react';

export function EmailPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    email_on_review_response: true,
    email_on_purchase: true,
    email_on_payout: true,
    email_on_welcome: true,
    email_on_license_delivery: true,
    email_marketing: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: string, value: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, [key]: value }));
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          <CardTitle>Email Notifications</CardTitle>
        </div>
        <CardDescription>
          Choose which email notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="review-response" className="text-base">
              Review Responses
            </Label>
            <p className="text-sm text-gray-500">
              Get notified when sellers respond to your reviews
            </p>
          </div>
          <Switch
            id="review-response"
            checked={preferences.email_on_review_response}
            onCheckedChange={(checked) => updatePreference('email_on_review_response', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="purchase" className="text-base">
              Purchase Notifications
            </Label>
            <p className="text-sm text-gray-500">
              Get notified when your hooks are purchased
            </p>
          </div>
          <Switch
            id="purchase"
            checked={preferences.email_on_purchase}
            onCheckedChange={(checked) => updatePreference('email_on_purchase', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="payout" className="text-base">
              Payout Updates
            </Label>
            <p className="text-sm text-gray-500">
              Get notified when payouts are processed
            </p>
          </div>
          <Switch
            id="payout"
            checked={preferences.email_on_payout}
            onCheckedChange={(checked) => updatePreference('email_on_payout', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="license" className="text-base">
              License Delivery
            </Label>
            <p className="text-sm text-gray-500">
              Receive license keys and download links
            </p>
          </div>
          <Switch
            id="license"
            checked={preferences.email_on_license_delivery}
            onCheckedChange={(checked) => updatePreference('email_on_license_delivery', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing" className="text-base">
              Marketing Emails
            </Label>
            <p className="text-sm text-gray-500">
              Receive updates about new features and promotions
            </p>
          </div>
          <Switch
            id="marketing"
            checked={preferences.email_marketing}
            onCheckedChange={(checked) => updatePreference('email_marketing', checked)}
          />
        </div>

      </CardContent>
    </Card>
  );
}
