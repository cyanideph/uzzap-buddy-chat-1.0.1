import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { Profile } from '../types/database.types';

type AuthState = {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    set({ isLoading: true });
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const profile = await authService.getProfile(session.user.id);
      set({ user: session.user, profile, isLoading: false });
    } else {
      set({ user: null, profile: null, isLoading: false });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        set({ user: session.user, profile });
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    
    const updatedProfile = await authService.updateProfile(user.id, updates);
    if (updatedProfile) {
      set({ profile: updatedProfile });
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null, profile: null });
  }
}));
