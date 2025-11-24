import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, DollarSign, Music, Edit2, Save, Download, ShoppingBag, Loader2, CreditCard, BarChart3, Key, TrendingUp, Users, Star, Play, ListMusic, Layers, AlertCircle } from 'lucide-react';



import { PaymentReceipt } from '@/components/PaymentReceipt';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import HookAnalytics from '@/components/HookAnalytics';
import AnalyticsOverview from '@/components/AnalyticsOverview';
import AnalyticsTab from '@/components/AnalyticsTab';
import { EmailPreferences } from '@/components/EmailPreferences';
import { FollowersModal } from '@/components/FollowersModal';
import { ActivityFeed } from '@/components/ActivityFeed';
import { LicenseCertificate } from '@/components/LicenseCertificate';
import { Badge } from '@/components/ui/badge';
import { BulkLicenseManager } from '@/components/BulkLicenseManager';
import { BundleCreator } from '@/components/BundleCreator';
import SubscriptionAnalytics from '@/components/SubscriptionAnalytics';
import { StripeConnectOnboarding } from '@/components/StripeConnectOnboarding';
import { SellerEarnings } from '@/components/SellerEarnings';
import { PayoutSettings } from '@/components/PayoutSettings';
import { PayoutHistory } from '@/components/PayoutHistory';
import { PayoutScheduleSettings } from '@/components/PayoutScheduleSettings';
import { ExchangeRateWidget } from '@/components/ExchangeRateWidget';
import { CurrencyConverter } from '@/components/CurrencyConverter';

import { DisputeCreationModal } from '@/components/DisputeCreationModal';
import { DisputeCard } from '@/components/DisputeCard';
import { DisputeDetailView } from '@/components/DisputeDetailView';
import EditHookModal from '@/components/EditHookModal';
import HookManagementCard from '@/components/HookManagementCard';
import { ProfileSettings } from '@/components/ProfileSettings';





import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlaylistCreationModal from '@/components/PlaylistCreationModal';
import PlaylistCard from '@/components/PlaylistCard';
import PlaylistDetailView from '@/components/PlaylistDetailView';


const Profile: React.FC = () => {

  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [downloadingHookId, setDownloadingHookId] = useState<string | null>(null);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeOnboardingCompleted, setStripeOnboardingCompleted] = useState(false);
  const [stripeChargesEnabled, setStripeChargesEnabled] = useState(false);
  const [isSettingUpStripe, setIsSettingUpStripe] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following' | 'mutual'>('followers');
  const [totalPlays, setTotalPlays] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [isEditHookModalOpen, setIsEditHookModalOpen] = useState(false);
  const [selectedHook, setSelectedHook] = useState<any>(null);



  useEffect(() => {
    if (user) {
      fetchPurchases();
      fetchEarnings();
      fetchPayouts();
      checkStripeAccount();
      fetchFollowerStats();
      fetchProfileStats();
      fetchPlaylists();
      fetchDisputes();
    }
  }, [user]);

  const fetchDisputes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .or(`complainant_id.eq.${user.id},respondent_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setDisputes(data);
    }
  };

  const fetchPlaylists = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('playlists')
      .select('*, playlist_items(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      const playlistsWithCount = data.map(p => ({
        ...p,
        item_count: p.playlist_items?.[0]?.count || 0
      }));
      setPlaylists(playlistsWithCount);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPurchases();
      fetchEarnings();
      fetchPayouts();
      checkStripeAccount();
      fetchFollowerStats();
      fetchProfileStats();
      fetchMyHooks();
    }
  }, [user]);


  const fetchFollowerStats = async () => {
    if (!user) return;
    const { data: followersData } = await supabase.from('followers').select('id').eq('following_id', user.id);
    const { data: followingData } = await supabase.from('followers').select('id').eq('follower_id', user.id);
    setFollowersCount(followersData?.length || 0);
    setFollowingCount(followingData?.length || 0);
  };

  const fetchProfileStats = async () => {
    if (!user) return;
    const { data: hooks } = await supabase.from('hooks').select('plays').eq('user_id', user.id);

    const plays = hooks?.reduce((sum, h) => sum + (h.plays || 0), 0) || 0;
    setTotalPlays(plays);
    
    const { data: reviews } = await supabase.from('reviews').select('rating').eq('user_id', user.id);

    const avgRating = reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    setAverageRating(avgRating);
  };


  const checkStripeAccount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-stripe-status');
      
      if (error) throw error;
      
      if (data) {
        setStripeAccountId(data.accountId || null);
        setStripeOnboardingCompleted(data.onboardingCompleted || false);
        setStripeChargesEnabled(data.chargesEnabled || false);
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error);
    }
  };


  const handleSetupStripeConnect = async () => {
    setIsSettingUpStripe(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set up Stripe Connect',
        variant: 'destructive'
      });
    } finally {
      setIsSettingUpStripe(false);
    }
  };


  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        hooks (
          id,
          title,
          genre,
          price
        )
      `)
      .eq('buyer_id', user?.id)
      .eq('status', 'completed');
    
    if (!error && data) {
      setPurchases(data);
    }
  };


  const fetchEarnings = async () => {
    const { data, error } = await supabase
      .from('earnings')
      .select('*, purchases(*)')
      .eq('user_id', user?.id);

    
    if (!error && data) {
      setEarnings(data);
      const total = data.reduce((acc, e) => acc + parseFloat(e.amount), 0);
      setTotalEarnings(total);
      
      // Calculate available balance (total earnings minus pending/completed payouts)
      const { data: payoutData } = await supabase
        .from('payouts')
        .select('amount, status')
        .eq('user_id', user?.id)
        .in('status', ['pending', 'approved', 'completed']);
      
      const paidOut = payoutData?.reduce((acc, p) => acc + parseFloat(p.amount.toString()), 0) || 0;
      setAvailableBalance(total - paidOut);
    }
  };

  const fetchPayouts = async () => {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setPayouts(data);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || !paymentMethod || !paymentDetails) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (amount <= 0 || amount > availableBalance) {
      toast({ title: 'Error', description: 'Invalid payout amount', variant: 'destructive' });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('request-payout', {
        body: { amount, paymentMethod, paymentDetails: { details: paymentDetails } },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.error) throw response.error;

      toast({ title: 'Success', description: 'Payout request submitted successfully!' });
      setIsPayoutDialogOpen(false);
      setPayoutAmount('');
      setPaymentMethod('');
      setPaymentDetails('');
      fetchPayouts();
      fetchEarnings();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDownloadHook = async (hookId: string) => {
    try {
      setDownloadingHookId(hookId);
      
      // Fetch the hook data from the database
      const { data: hookData, error: hookError } = await supabase
        .from('hooks')
        .select('audio_url, title')
        .eq('id', hookId)
        .single();
      
      if (hookError) throw new Error('Failed to fetch hook data');
      if (!hookData || !hookData.audio_url) throw new Error('Audio file not found');
      
      // Get the public URL for the audio file
      const { data: urlData } = supabase.storage
        .from('hooks')
        .getPublicUrl(hookData.audio_url);
      
      if (!urlData.publicUrl) throw new Error('Failed to get download URL');
      
      // Trigger download
      const response = await fetch(urlData.publicUrl);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${hookData.title || 'hook'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ 
        title: 'Success', 
        description: 'Hook downloaded successfully!' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to download hook', 
        variant: 'destructive' 
      });
    } finally {
      setDownloadingHookId(null);
    }
  };



  if (!user) return null;

  const handleSave = () => {
    updateProfile({ username, bio });
    setIsEditing(false);
  };

  const [myHooks, setMyHooks] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchMyHooks();
    }
  }, [user]);

  const fetchMyHooks = async () => {
    const { data, error } = await supabase
      .from('hooks')
      .select('*')
      .eq('user_id', user?.id)

      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setMyHooks(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-24">

      <Navigation />
      <EmailVerificationBanner />
      <div className="max-w-6xl mx-auto px-4 py-8">

        <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <div>
                {isEditing ? (
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} className="mb-2 bg-gray-700 border-gray-600 text-white" />
                ) : (
                  <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                )}
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
            <Button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
              {isEditing ? <><Save size={16} className="mr-2" /> Save</> : <><Edit2 size={16} className="mr-2" /> Edit</>}
            </Button>
          </div>
          {isEditing ? (
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="bg-gray-700 border-gray-600 text-white" />
          ) : (
            <p className="text-gray-300 mb-4">{bio || 'No bio yet'}</p>
          )}
          <div className="flex gap-6 pt-4 border-t border-gray-700">
            <button onClick={() => { setFollowersModalTab('followers'); setIsFollowersModalOpen(true); }} className="flex items-center gap-2 hover:text-purple-400 transition-colors">
              <Users size={20} className="text-purple-400" />
              <div className="text-left">
                <p className="text-white font-bold">{followersCount}</p>
                <p className="text-gray-400 text-sm">Followers</p>
              </div>
            </button>
            <button onClick={() => { setFollowersModalTab('following'); setIsFollowersModalOpen(true); }} className="flex items-center gap-2 hover:text-purple-400 transition-colors">
              <Users size={20} className="text-pink-400" />
              <div className="text-left">
                <p className="text-white font-bold">{followingCount}</p>
                <p className="text-gray-400 text-sm">Following</p>
              </div>
            </button>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 p-4">
              <Play className="text-white mb-2" size={28} />
              <h3 className="text-white text-xl font-bold">{totalPlays.toLocaleString()}</h3>
              <p className="text-blue-200 text-sm">Total Plays</p>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-4">
              <Star className="text-white mb-2" size={28} />
              <h3 className="text-white text-xl font-bold">{averageRating.toFixed(1)}</h3>
              <p className="text-yellow-200 text-sm">Avg Rating</p>
            </Card>
          </div>
          <ActivityFeed userId={user.id} />
        </div>


        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 p-6">
            <DollarSign className="text-white mb-2" size={32} />
            <h3 className="text-white text-2xl font-bold">${totalEarnings.toFixed(2)}</h3>
            <p className="text-purple-200">Total Earnings</p>
          </Card>
          <Card className="bg-gradient-to-br from-pink-600 to-pink-700 p-6">
            <ShoppingBag className="text-white mb-2" size={32} />
            <h3 className="text-white text-2xl font-bold">{purchases.length}</h3>
            <p className="text-pink-200">Hooks Purchased</p>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6">
            <Music className="text-white mb-2" size={32} />
            <h3 className="text-white text-2xl font-bold">{myHooks.length}</h3>
            <p className="text-indigo-200">Hooks Uploaded</p>
          </Card>
        </div>

        <Tabs defaultValue="uploads" className="w-full">
          <TabsList className="grid w-full grid-cols-11 bg-gray-800 mb-6">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="uploads">My Uploads</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
            <TabsTrigger value="playlists">
              <ListMusic size={16} className="mr-1" />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="advanced">
              <TrendingUp size={16} className="mr-1" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="sub-analytics">
              <BarChart3 size={16} className="mr-1" />
              Sub Analytics
            </TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="bulk">Bulk</TabsTrigger>
            <TabsTrigger value="preferences">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <ProfileSettings />
          </TabsContent>


          <TabsContent value="uploads">
            <div className="space-y-4">
              {myHooks.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                  <Music size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No uploads yet. Start uploading your hooks!</p>
                </Card>
              ) : (
                myHooks.map(hook => (
                  <HookManagementCard
                    key={hook.id}
                    hook={hook}
                    onEdit={() => {
                      setSelectedHook(hook);
                      setIsEditHookModalOpen(true);
                    }}
                    onDelete={fetchMyHooks}
                  />
                ))
              )}
            </div>
          </TabsContent>


          <TabsContent value="purchases">
            <div className="space-y-4">
              {purchases.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                  <p className="text-gray-400">No purchases yet. Browse the marketplace to find hooks!</p>
                </Card>
              ) : (
                purchases.map(purchase => (
                  <Card key={purchase.id} className="bg-gray-800 border-gray-700 p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-white font-bold">
                            {purchase.hooks?.title || `Hook #${purchase.hook_id.substring(0, 8)}`}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {purchase.hooks?.genre && `${purchase.hooks.genre} • `}
                            Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={purchase.license_type === 'exclusive' ? 'default' : 'secondary'}>
                              {purchase.license_type === 'exclusive' ? 'Exclusive' : 'Non-Exclusive'}
                            </Badge>
                            {purchase.license_key && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Key size={12} />
                                <span className="font-mono">{purchase.license_key}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-green-400 font-bold">${purchase.amount}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleDownloadHook(purchase.hook_id)}
                          disabled={downloadingHookId === purchase.hook_id}
                        >
                          {downloadingHookId === purchase.hook_id ? (
                            <>
                              <Loader2 size={14} className="mr-1 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={14} className="mr-1" />
                              Download
                            </>
                          )}
                        </Button>
                        {purchase.license_key && (
                          <LicenseCertificate
                            hookTitle={purchase.hooks?.title || 'Hook'}
                            sellerName="Seller"
                            buyerEmail={user?.email || ''}
                            licenseType={purchase.license_type || 'non_exclusive'}
                            licenseKey={purchase.license_key}
                            price={purchase.amount}
                            purchaseDate={purchase.created_at}
                          />
                          )}
                        <PaymentReceipt purchase={purchase} buyerEmail={user?.email || ''} />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="playlists">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">My Playlists</h2>
              <Button onClick={() => setIsPlaylistModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <ListMusic className="mr-2 h-4 w-4" />
                Create Playlist
              </Button>
            </div>
            {playlists.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                <ListMusic className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No playlists yet. Create your first playlist to organize your favorite hooks!</p>
                <Button onClick={() => setIsPlaylistModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                  Create Your First Playlist
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map(playlist => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => setSelectedPlaylistId(playlist.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            {myHooks.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hooks uploaded yet. Upload hooks to see analytics!</p>
              </Card>
            ) : (
              <AnalyticsTab myHooks={myHooks} earnings={earnings} />
            )}
          </TabsContent>

          <TabsContent value="advanced">
            {myHooks.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hooks uploaded yet. Upload hooks to see advanced analytics!</p>
              </Card>
            ) : (
              <AdvancedAnalytics />
            )}
          </TabsContent>

          <TabsContent value="sub-analytics">
            <SubscriptionAnalytics />
          </TabsContent>



          <TabsContent value="earnings">
            <div className="space-y-6">
              <StripeConnectOnboarding
                isConnected={!!stripeAccountId}
                onboardingCompleted={stripeOnboardingCompleted}
                chargesEnabled={stripeChargesEnabled}
                onRefresh={checkStripeAccount}
              />

              
              <SellerEarnings />
              
              <div className="grid md:grid-cols-2 gap-6">
                <ExchangeRateWidget />
                <CurrencyConverter />
              </div>
              
              <ExchangeRateChart />
              
              <PayoutScheduleSettings />
              
              <PayoutSettings />

              
              <PayoutHistory />
            </div>
          </TabsContent>




          <TabsContent value="subscription">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Subscription Plans</h2>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400">
                  Current Plan: <span className="text-purple-400 font-bold">{user?.tier?.toUpperCase() || 'FREE'}</span>
                </p>
                {user?.tier && user.tier !== 'free' && (
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.functions.invoke('manage-billing-portal', {
                          body: { customerId: user.stripe_customer_id }
                        });
                        if (error) throw error;
                        if (data?.url) window.location.href = data.url;
                      } catch (err: any) {
                        toast({ title: 'Error', description: err.message, variant: 'destructive' });
                      }
                    }}
                  >
                    Manage Subscription
                  </Button>
                )}
              </div>
            </div>
            <SubscriptionPlans currentTier={user?.tier || 'free'} />
          </TabsContent>


          <TabsContent value="bulk">
            <div className="space-y-6">
              <BulkLicenseManager />
              <BundleCreator />
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <EmailPreferences />
          </TabsContent>

        </Tabs>

        <FollowersModal 
          isOpen={isFollowersModalOpen} 
          onClose={() => setIsFollowersModalOpen(false)} 
          userId={user.id} 
          initialTab={followersModalTab}
        />

        <PlaylistCreationModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          onPlaylistCreated={fetchPlaylists}
        />

        <PlaylistDetailView
          playlistId={selectedPlaylistId}
          onClose={() => setSelectedPlaylistId(null)}
        />

        <EditHookModal
          isOpen={isEditHookModalOpen}
          onClose={() => {
            setIsEditHookModalOpen(false);
            setSelectedHook(null);
          }}
          hook={selectedHook}
          onSuccess={() => {
            fetchMyHooks();
            setIsEditHookModalOpen(false);
            setSelectedHook(null);
          }}
        />

      </div>
      <Footer />
    </div>
  );
};

export default Profile;
