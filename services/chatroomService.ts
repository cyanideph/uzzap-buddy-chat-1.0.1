import { supabase } from '../lib/supabase';
import { Chatroom, ChatroomMember, Profile } from '../types/database.types';

export const chatroomService = {
  async getChatrooms(): Promise<Chatroom[]> {
    const { data, error } = await supabase
      .from('chatrooms')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching chatrooms:', error);
      return [];
    }

    return data;
  },

  async joinChatroom(chatroomId: string, userId: string): Promise<ChatroomMember | null> {
    const { data, error } = await supabase
      .from('chatroom_members')
      .upsert([{ chatroom_id: chatroomId, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error joining chatroom:', error);
      return null;
    }

    return data;
  },

  async leaveChatroom(chatroomId: string, userId: string) {
    const { error } = await supabase
      .from('chatroom_members')
      .delete()
      .eq('chatroom_id', chatroomId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error leaving chatroom:', error);
    }
  },

  async getChatroomMembers(chatroomId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('chatroom_members')
      .select('profiles(*)')
      .eq('chatroom_id', chatroomId);

    if (error) {
      console.error('Error fetching chatroom members:', error);
      return [];
    }

    return data.map((item: any) => item.profiles);
  },

  async createDirectChat(userId: string, buddyId: string): Promise<Chatroom | null> {
    const slug = [userId, buddyId].sort().join('-');
    
    // Check if chatroom already exists
    const { data: existingChatroom } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('slug', slug)
      .single();

    if (existingChatroom) return existingChatroom;

    // Create new direct chat
    const { data, error } = await supabase
      .from('chatrooms')
      .insert([{
        name: `Direct Chat`,
        slug,
        type: 'direct',
        created_by: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating direct chat:', error);
      return null;
    }

    // Add both as members
    await supabase.from('chatroom_members').insert([
      { chatroom_id: data.id, user_id: userId },
      { chatroom_id: data.id, user_id: buddyId }
    ]);

    return data;
  }
};
