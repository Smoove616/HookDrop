import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  unreadMessages: number;
  unreadNotifications: number;
  refreshNotifications: () => void;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  unreadMessages: 0,
  unreadNotifications: 0,
  refreshNotifications: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const refreshNotifications = async () => {
    if (!user) return;

    const { count: msgCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    const { count: notifCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setUnreadMessages(msgCount || 0);
    setUnreadNotifications(notifCount || 0);
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        unreadMessages,
        unreadNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
