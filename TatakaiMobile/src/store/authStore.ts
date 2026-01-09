import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  profile: {
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setProfile: (profile: AuthState['profile']) => void;
  setAdmin: (isAdmin: boolean) => void;
  setBanned: (isBanned: boolean) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  isBanned: false,
  profile: null,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setProfile: (profile) => set({ profile }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  setBanned: (isBanned) => set({ isBanned }),
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, isAdmin: false, isBanned: false });
  },
  
  refreshSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ session, user: session.user });
        
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url, bio, is_banned')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) {
          set({ 
            profile: {
              username: profile.username,
              displayName: profile.display_name,
              avatarUrl: profile.avatar_url,
              bio: profile.bio,
            },
            isBanned: profile.is_banned || false,
          });
        }
        
        // Check admin role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        set({ isAdmin: !!roleData });
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
