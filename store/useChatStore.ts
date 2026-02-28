import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { messageService } from '../services/messageService';
import { chatroomService } from '../services/chatroomService';
import { Message, Chatroom, Profile } from '../types/database.types';

type ChatState = {
  chatrooms: Chatroom[];
  messages: Record<string, Message[]>;
  members: Record<string, Profile[]>;
  isLoading: boolean;
  typingUsers: Record<string, Set<string>>;
  activeChatroomId: string | null;

  setChatrooms: (chatrooms: Chatroom[]) => void;
  setActiveChatroom: (chatroomId: string | null) => void;
  fetchChatrooms: () => Promise<void>;
  fetchMessages: (chatroomId: string) => Promise<void>;
  fetchMembers: (chatroomId: string) => Promise<void>;
  addMessage: (chatroomId: string, message: Message) => void;
  setTyping: (chatroomId: string, userId: string, isTyping: boolean) => void;
  subscribeToChatroom: (chatroomId: string) => () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  chatrooms: [],
  messages: {},
  members: {},
  isLoading: false,
  typingUsers: {},
  activeChatroomId: null,

  setChatrooms: (chatrooms) => set({ chatrooms }),
  setActiveChatroom: (chatroomId) => set({ activeChatroomId: chatroomId }),

  fetchChatrooms: async () => {
    set({ isLoading: true });
    const chatrooms = await chatroomService.getChatrooms();
    set({ chatrooms, isLoading: false });
  },

  fetchMessages: async (chatroomId) => {
    const messages = await messageService.getMessages(chatroomId);
    set((state) => ({
      messages: { ...state.messages, [chatroomId]: messages }
    }));
  },

  fetchMembers: async (chatroomId) => {
    const members = await chatroomService.getChatroomMembers(chatroomId);
    set((state) => ({
      members: { ...state.members, [chatroomId]: members }
    }));
  },

  addMessage: (chatroomId, message) => {
    set((state) => {
      const currentMessages = state.messages[chatroomId] || [];
      // Deduplicate
      if (currentMessages.find((m) => m.id === message.id)) return state;
      
      return {
        messages: {
          ...state.messages,
          [chatroomId]: [...currentMessages, message]
        }
      };
    });
  },

  setTyping: (chatroomId, userId, isTyping) => {
    set((state) => {
      const currentTyping = state.typingUsers[chatroomId] || new Set();
      const nextTyping = new Set(currentTyping);
      if (isTyping) nextTyping.add(userId);
      else nextTyping.delete(userId);
      
      return {
        typingUsers: {
          ...state.typingUsers,
          [chatroomId]: nextTyping
        }
      };
    });
  },

  subscribeToChatroom: (chatroomId) => {
    const channel = supabase
      .channel(`chatroom:${chatroomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chatroom_id=eq.${chatroomId}`
        },
        async (payload) => {
          // Fetch sender profile for new message
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single();
          
          const messageWithSender = { ...payload.new, sender };
          get().addMessage(chatroomId, messageWithSender as any);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        // Presence updates handled here if needed
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // User joined
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // User left
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}));