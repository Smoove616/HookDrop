import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Music, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PurchaseSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    loadPurchase();
  }, [sessionId]);

  const loadPurchase = async () => {
    if (!user || !sessionId) {
      setLoading(false);
      return;
    }
    
    const { data } = await supabase
      .from('purchases')
      .select('*, hooks(*)')
      .eq('buyer_id', user.id)
      .eq('stripe_session_id', sessionId)
      .single();
    
    setPurchase(data);
    setLoading(false);
  };

  const handleDownload = async (hookId: string) => {
    const { data } = await supabase.storage
      .from('hooks')
      .createSignedUrl(`${hookId}.mp3`, 3600);
    
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const copyLicenseKey = () => {
    if (purchase?.license_key) {
      navigator.clipboard.writeText(purchase.license_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl text-white mb-4">Purchase not found</h1>
          <Button onClick={() => navigate('/profile')}>View Purchases</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Purchase Complete!</h1>
          <p className="text-gray-400">Your hook is ready to download</p>
        </div>

        <Card className="bg-gray-800 border-gray-700 p-8 mb-6">
          <div className="flex items-start gap-6">
            <Music className="text-purple-400 flex-shrink-0" size={48} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{purchase.hooks?.title}</h2>
              <p className="text-gray-400 mb-4 capitalize">{purchase.license_type.replace('_', ' ')} License</p>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <label className="text-sm text-gray-400 block mb-2">License Key</label>
                <div className="flex items-center gap-2">
                  <code className="text-green-400 font-mono text-lg flex-1">{purchase.license_key}</code>
                  <Button size="sm" variant="outline" onClick={copyLicenseKey}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400">Amount Paid</p>
                  <p className="text-white font-semibold">${purchase.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Purchase Date</p>
                  <p className="text-white font-semibold">
                    {new Date(purchase.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button onClick={() => handleDownload(purchase.hook_id)} className="w-full">
                <Download size={16} className="mr-2" />
                Download Hook
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/profile')} variant="outline">
            View All Purchases
          </Button>
          <Button onClick={() => navigate('/discover')}>
            Browse More Hooks
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PurchaseSuccess;
