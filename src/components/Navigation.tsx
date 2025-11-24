import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Bell, User, Upload, LogOut, Shield, CheckCircle, MessageSquare, ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
import HookDropLogo from './HookDropLogo';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import UploadModal from './UploadModal';
import NotificationPanel from './NotificationPanel';
import ShoppingCartComponent from './ShoppingCart';
import { supabase } from '@/lib/supabase';


const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const { unreadMessages, unreadNotifications } = useAppContext();
  const { itemCount } = useCart();
  const navigate = useNavigate();


  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (user) {
      const { data } = await supabase.auth.getUser();
      setIsAdmin(data?.user?.user_metadata?.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  };

  const handleUploadClick = () => {
    if (isAuthenticated) {
      setShowUpload(true);
    } else {
      setShowLogin(true);
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
    <nav className="bg-gray-900/95 backdrop-blur-sm shadow-xl border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0">
            <HookDropLogo className="w-28 sm:w-32 h-10 sm:h-12" />
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
               <Input
                 type="text"
                 placeholder="Search hooks, artists, genres..."
                 className="pl-10 pr-4 py-2 w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
               />
             </div>
           </div>

           <div className="hidden md:flex items-center space-x-2">
             <Button onClick={() => navigate('/discover')} variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
               Discover
             </Button>
             <Button onClick={() => navigate('/verify')} variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
               <CheckCircle size={16} className="mr-1" />
               Verify
             </Button>
              
             <Button onClick={handleUploadClick} size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
               <Upload size={16} className="mr-2" />
               Upload
             </Button>

                {isAuthenticated ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative text-gray-300 hover:text-purple-400"
                      onClick={() => setShowCart(true)}
                    >
                      <ShoppingCart size={20} />
                      {itemCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-purple-500 text-xs">
                          {itemCount}
                        </Badge>
                      )}
                    </Button>

                    {isAdmin && (
                      <Button onClick={() => navigate('/admin')} variant="ghost" size="icon" className="text-yellow-400 hover:text-yellow-300">
                        <Shield size={20} />
                      </Button>
                    )}

                   <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-purple-400">
                     <MessageSquare size={20} />
                     {unreadMessages > 0 && (
                       <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                         {unreadMessages}
                       </Badge>
                     )}
                   </Button>
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="relative text-gray-300 hover:text-purple-400"
                        onClick={() => setShowNotifications(!showNotifications)}
                      >
                        <Bell size={20} />
                        {unreadNotifications > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                            {unreadNotifications}
                          </Badge>
                        )}
                      </Button>
                      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
                    </div>
                     <Button onClick={() => navigate('/profile')} variant="ghost" size="icon" className="text-gray-300 hover:text-purple-400">
                       <User size={20} />
                     </Button>
                   <Button onClick={logout} variant="ghost" size="icon" className="text-gray-300 hover:text-purple-400">
                     <LogOut size={20} />
                   </Button>
                 </>
              ) : (
                <Button onClick={() => setShowLogin(true)} variant="ghost" size="sm" className="text-gray-300 hover:text-purple-400">
                  Login
                </Button>
              )}

           </div>

          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-300 hover:text-purple-400 h-11 w-11"
                  onClick={() => setShowCart(true)}
                >
                  <ShoppingCart size={22} />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-purple-500 text-xs">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-300 hover:text-purple-400 h-11 w-11"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell size={22} />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                  {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
                </div>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-purple-400 h-11 w-11"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </Button>
          </div>
        </div>

        <div className="md:hidden pb-3">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search hooks..."
              className="pl-10 pr-4 py-3 w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-base"
            />
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-2 pb-4">
            <div className="flex flex-col space-y-1">
              <Button onClick={() => handleNavClick('/discover')} variant="ghost" className="justify-start text-gray-300 hover:text-purple-400 h-12 text-base">
                Discover
              </Button>
              <Button onClick={() => handleNavClick('/verify')} variant="ghost" className="justify-start text-gray-300 hover:text-purple-400 h-12 text-base">
                <CheckCircle size={18} className="mr-2" />
                Verify License
              </Button>
              <Button onClick={handleUploadClick} className="justify-start bg-gradient-to-r from-purple-500 to-pink-500 text-white h-12 text-base">
                <Upload size={18} className="mr-2" />
                Upload Hook
              </Button>

              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Button onClick={() => handleNavClick('/admin')} variant="ghost" className="justify-start text-yellow-400 hover:text-yellow-300 h-12 text-base">
                      <Shield size={18} className="mr-2" />
                      Admin Panel
                    </Button>
                  )}
                  <Button onClick={() => handleNavClick('/profile')} variant="ghost" className="justify-start text-gray-300 hover:text-purple-400 h-12 text-base">
                    <User size={18} className="mr-2" />
                    My Profile
                  </Button>
                  <Button onClick={() => { logout(); setIsMenuOpen(false); }} variant="ghost" className="justify-start text-gray-300 hover:text-purple-400 h-12 text-base">
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => { setShowLogin(true); setIsMenuOpen(false); }} variant="ghost" className="justify-start text-gray-300 hover:text-purple-400 h-12 text-base">
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>

    <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} />
    <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} />
    <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} onUploadSuccess={() => window.location.reload()} />
    <ShoppingCartComponent isOpen={showCart} onClose={() => setShowCart(false)} />

    </>
  );
};

export default Navigation;
