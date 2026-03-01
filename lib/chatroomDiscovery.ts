import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatroomService } from '../services/chatroomService';
import { Chatroom } from '../types/database.types';

export type DiscoveryTab = 'trending' | 'new' | 'nearby';
export type ChatroomCategory = 'Sports' | 'Gaming' | 'Study' | 'Music' | 'Tech' | 'Lifestyle' | 'Career';

export type ChatroomDiscoveryItem = {
  id: string;
  name: string;
  slug: string;
  about: string;
  rules: string[];
  admins: string[];
  memberCount: number;
  privacy: 'public' | 'private';
  language: string;
  tags: string[];
  category: ChatroomCategory;
  region: string;
  createdAt: string;
  trendingScore: number;
};

const SAVED_KEY = 'chatroom:saved:v1';
const RECENT_KEY = 'chatroom:recent:v1';

export const discoveryTabs: { key: DiscoveryTab; label: string }[] = [
  { key: 'trending', label: 'Trending' },
  { key: 'new', label: 'New' },
  { key: 'nearby', label: 'Nearby' },
];

export const categories: ChatroomCategory[] = ['Sports', 'Gaming', 'Study', 'Music', 'Tech', 'Lifestyle', 'Career'];

export const getDiscoverRooms = async (tab: DiscoveryTab): Promise<Chatroom[]> => {
  if (tab === 'new') {
    return chatroomService.getNewChatrooms();
  }

  if (tab === 'nearby') {
    // Nearby would normally use geolocation, but for now we'll just return trending
    return chatroomService.getTrendingChatrooms();
  }

  return chatroomService.getTrendingChatrooms();
};

export const searchChatrooms = async (query: string): Promise<Chatroom[]> => {
  return chatroomService.searchChatrooms(query);
};

const loadList = async (key: string): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveList = async (key: string, list: string[]) => {
  await AsyncStorage.setItem(key, JSON.stringify(list));
};

export const getSavedRoomIds = () => loadList(SAVED_KEY);
export const getRecentRoomIds = () => loadList(RECENT_KEY);

export const toggleSavedRoom = async (roomId: string) => {
  const current = await getSavedRoomIds();
  const next = current.includes(roomId) ? current.filter((id) => id !== roomId) : [roomId, ...current];
  await saveList(SAVED_KEY, next);
  return next;
};

export const markRoomVisited = async (roomId: string) => {
  const current = await getRecentRoomIds();
  const next = [roomId, ...current.filter((id) => id !== roomId)].slice(0, 20);
  await saveList(RECENT_KEY, next);
  return next;
};

export const getRoomsByIds = async (ids: string[]): Promise<Chatroom[]> => {
  if (ids.length === 0) return [];
  
  // This is a simplified version - in production you'd use a single IN query
  const rooms = await chatroomService.getChatrooms();
  return rooms.filter(room => ids.includes(room.id));
};