export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  region: string | null;
  status_message: string | null;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
};

export type Chatroom = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  type: 'public' | 'private' | 'direct';
  created_by: string | null;
  created_at: string;
};

export type ChatroomMember = {
  id: string;
  chatroom_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
};

export type Buddy = {
  id: string;
  user_id: string;
  buddy_id: string;
  status: 'accepted' | 'blocked';
  created_at: string;
};

export type BuddyRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};

export type Message = {
  id: string;
  chatroom_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'system';
  metadata: any;
  is_deleted: boolean;
  reply_to: string | null;
  created_at: string;
};

export type MessageRead = {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
};
