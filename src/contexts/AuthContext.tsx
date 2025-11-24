import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  totalEarnings: number;
  hooks: Hook[];
  emailVerified: boolean;
  tier?: string;
  subscriptionStatus?: string;
}


interface Hook {
  id: string;
  title: string;
  genre: string;
  price: number;
  plays: number;
  sales: number;
  earnings: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: any) => {
    // Fetch subscription data
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', authUser.id)
      .single();

    const mockUser: User = {
      id: authUser.id,
      email: authUser.email!,
      username: authUser.email!.split('@')[0],
      totalEarnings: 0,
      hooks: [],
      emailVerified: !!authUser.email_confirmed_at,
      tier: subscription?.tier || 'free',
      subscriptionStatus: subscription?.status || 'active'
    };
    setUser(mockUser);
  };

  const login = async (email: string, password: string) => {

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
  };

  const signup = async (email: string, username: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({ title: 'Logged out', description: 'See you soon!' });
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) throw new Error('No user logged in');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) throw error;
    toast({ title: 'Email sent!', description: 'Check your inbox for the verification link.' });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isEmailVerified: user?.emailVerified ?? false,
      login, 
      signup, 
      logout, 
      updateProfile,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};
