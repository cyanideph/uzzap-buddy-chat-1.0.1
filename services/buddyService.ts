import { supabase } from '../lib/supabase';
import { BuddyRequest, Profile } from '../types/database.types';

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

  async getBuddyRequests(userId: string): Promise<(BuddyRequest & { sender?: Profile | null })[]> {
    const { data, error } = await supabase
      .from('buddy_requests')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching buddy requests:', error);
      return [];
    }

    const enriched = await Promise.all(
      data.map(async (request: any) => {
        const { data: sender } = await supabase.from('profiles').select('*').eq('id', request.sender_id).maybeSingle();
        return { ...request, sender };
      })
    );

    return enriched;
  },

  async acceptBuddyRequest(requestId: string, senderId: string, receiverId: string) {
    await supabase.from('buddy_requests').update({ status: 'accepted' }).eq('id', requestId);

    await supabase.from('buddies').upsert([
      { user_id: senderId, buddy_id: receiverId, status: 'accepted' },
      { user_id: receiverId, buddy_id: senderId, status: 'accepted' },
    ]);
  },

  async declineBuddyRequest(requestId: string) {
    const { error } = await supabase.from('buddy_requests').update({ status: 'declined' }).eq('id', requestId);

    if (error) {
      console.error('Error declining buddy request:', error);
    }
  },

  async getBuddyRelationship(userId: string, otherUserId: string): Promise<'accepted' | 'pending' | 'none'> {
    const { data: buddy } = await supabase
      .from('buddies')
      .select('status')
      .eq('user_id', userId)
      .eq('buddy_id', otherUserId)
      .maybeSingle();

    if (buddy?.status === 'accepted') return 'accepted';

    const { data: request } = await supabase
      .from('buddy_requests')
      .select('status')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .eq('status', 'pending')
      .maybeSingle();

    if (request?.status === 'pending') return 'pending';
    return 'none';
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
  },
};
