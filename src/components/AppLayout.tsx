import React, { useState } from 'react';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import MarketplaceFeed from './MarketplaceFeed';
import StatsSection from './StatsSection';
import Footer from './Footer';
import EmailVerificationBanner from './EmailVerificationBanner';
import UploadCTA from './UploadCTA';
import UploadModal from './UploadModal';
import LoginModal from './LoginModal';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleUploadClick = () => {
    if (isAuthenticated) {
      setShowUpload(true);
    } else {
      setShowLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 pb-24">
      <Navigation />
      <EmailVerificationBanner />
      <HeroSection />
      <UploadCTA onUploadClick={handleUploadClick} />
      <MarketplaceFeed />
      <StatsSection />
      <Footer />
      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} onUploadSuccess={() => window.location.reload()} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSwitchToSignup={() => {}} />
    </div>
  );
};

export default AppLayout;

