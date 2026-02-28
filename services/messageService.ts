import { supabase } from '../lib/supabase';
import { Message, MessageRead } from '../types/database.types';

export const messageService = {
  async getMessages(chatroomId: string, limit: number = 30, before?: string): Promise<any[]> {
    let query = supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('chatroom_id', chatroomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data.reverse();
  },

  async sendMessage(message: Partial<Message>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  },

  async markAsRead(messageId: string, userId: string): Promise<MessageRead | null> {
    const { data, error } = await supabase
      .from('message_reads')
      .upsert([{ message_id: messageId, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error marking message as read:', error);
      return null;
    }

    return data;
  },

  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
    }
  },

  async uploadMessageImage(uri: string, userId: string): Promise<string | null> {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `${userId}-${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('message-images')
      .upload(filename, blob);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('message-images')
      .getPublicUrl(data.path);

    return publicUrl;
  }
};