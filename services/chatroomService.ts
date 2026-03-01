import { supabase } from '../lib/supabase';
import { Chatroom, ChatroomMember, Profile } from '../types/database.types';

export const chatroomService = {
  async getChatrooms(type?: 'public' | 'private' | 'direct' | 'discovery'): Promise<Chatroom[]> {
    let query = supabase.from('chatrooms').select('*');
    
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('last_activity_at', { ascending: false });

    if (error) {
      console.error('Error fetching chatrooms:', error);
      return [];
    }

    return data;
  },

  async getChatroomsByCategory(category: string): Promise<Chatroom[]> {
    const { data, error } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('category', category)
      .order('member_count', { ascending: false });

    if (error) {
      console.error('Error fetching chatrooms by category:', error);
      return [];
    }

    return data;
  },

  async searchChatrooms(searchTerm: string): Promise<Chatroom[]> {
    const { data, error } = await supabase
      .from('chatrooms')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('member_count', { ascending: false });

    if (error) {
      console.error('Error searching chatrooms:', error);
      return [];
    }

    return data;
  },

  async getTrendingChatrooms(): Promise<Chatroom[]> {
    const { data, error } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('type', 'discovery')
      .order('member_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching trending chatrooms:', error);
      return [];
    }

    return data;
  },

  async getNewChatrooms(): Promise<Chatroom[]> {
    const { data, error } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('type', 'discovery')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching new chatrooms:', error);
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


  async getChatroomById(chatroomId: string): Promise<Chatroom | null> {
    const { data, error } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('id', chatroomId)
      .single();

    if (error) {
      console.error('Error fetching chatroom:', error);
      return null;
    }

    return data;
  },

  async getChatroomParticipants(chatroomId: string): Promise<Array<{ profile: Profile; role: string }>> {
    const { data, error } = await supabase
      .from('chatroom_members')
      .select('role, profiles(*)')
      .eq('chatroom_id', chatroomId);

    if (error) {
      console.error('Error fetching chatroom participants:', error);
      return [];
    }

    return data
      .map((item: any) => ({
        role: item.role ?? 'member',
        profile: item.profiles,
      }))
      .filter((item: { profile: Profile | null }) => !!item.profile);
  },

  async updateChatroom(chatroomId: string, updates: { description?: string; tags?: string[] }): Promise<Chatroom | null> {
    const { data, error } = await supabase
      .from('chatrooms')
      .update({
        description: updates.description,
        tags: updates.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatroomId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating chatroom:', error);
      return null;
    }

    return data;
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

  async createChatroom(params: {
    name: string;
    description?: string;
    type: 'public' | 'private' | 'discovery';
    category?: string;
    tags?: string[];
    region?: string;
    language?: string;
    userId: string;
  }): Promise<Chatroom | null> {
    const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const { data, error } = await supabase
      .from('chatrooms')
      .insert([{
        name: params.name,
        description: params.description,
        slug,
        type: params.type,
        category: params.category,
        tags: params.tags,
        region: params.region,
        language: params.language,
        created_by: params.userId,
        last_activity_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chatroom:', error);
      return null;
    }

    // Add creator as admin member
    await supabase.from('chatroom_members').insert([
      { chatroom_id: data.id, user_id: params.userId, role: 'admin' }
    ]);

    return data;
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
