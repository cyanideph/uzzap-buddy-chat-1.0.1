import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { Profile } from '../types/database.types';

type AuthState = {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  authSubscription: { unsubscribe: () => void } | null;
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
  authSubscription: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    set({ isLoading: true });

    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const profile = await authService.getProfile(session.user.id);
      set({ user: session.user, profile, isLoading: false });
    } else {
      set({ user: null, profile: null, isLoading: false });
    }

    const existingSubscription = get().authSubscription;
    existingSubscription?.unsubscribe();

    const { data } = supabase.auth.onAuthStateChange(async (_, changedSession) => {
      if (changedSession?.user) {
        const nextProfile = await authService.getProfile(changedSession.user.id);
        set({ user: changedSession.user, profile: nextProfile });
      } else {
        set({ user: null, profile: null });
      }
    });

    set({ authSubscription: data.subscription });
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
  },
}));
