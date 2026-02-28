import { supabase } from '../lib/supabase';
import { Buddy, BuddyRequest, Profile } from '../types/database.types';

export const buddyService = {
  async getBuddies(userId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('buddies')
      .select('profiles(*)')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching buddies:', error);
      return [];
    }

    return data.map((item: any) => item.profiles);
  },

  async sendBuddyRequest(senderId: string, receiverId: string): Promise<BuddyRequest | null> {
    const { data, error } = await supabase
      .from('buddy_requests')
      .upsert([{ sender_id: senderId, receiver_id: receiverId, status: 'pending' }])
      .select()
      .single();

    if (error) {
      console.error('Error sending buddy request:', error);
      return null;
    }

    return data;
  },

  async getBuddyRequests(userId: string): Promise<BuddyRequest[]> {
    const { data, error } = await supabase
      .from('buddy_requests')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching buddy requests:', error);
      return [];
    }

    return data;
  },

  async acceptBuddyRequest(requestId: string, senderId: string, receiverId: string) {
    // 1. Update buddy request status
    await supabase
      .from('buddy_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    // 2. Add as buddies for both sides
    await supabase.from('buddies').upsert([
      { user_id: senderId, buddy_id: receiverId, status: 'accepted' },
      { user_id: receiverId, buddy_id: senderId, status: 'accepted' }
    ]);
  },

  async removeBuddy(userId: string, buddyId: string) {
    await supabase
      .from('buddies')
      .delete()
      .or(`and(user_id.eq.${userId},buddy_id.eq.${buddyId}),and(user_id.eq.${buddyId},buddy_id.eq.${userId})`);
  },

  async searchBuddies(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching buddies:', error);
      return [];
    }

    return data;
  }
};
