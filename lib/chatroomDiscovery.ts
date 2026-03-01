import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatroomService } from '../services/chatroomService';
import { Chatroom } from '../types/database.types';

export type DiscoveryTab = 'trending' | 'new' | 'nearby';
export type ChatroomCategory = 'Luzon' | 'Visayas' | 'Mindanao';

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

export const categories: ChatroomCategory[] = ['Luzon', 'Visayas', 'Mindanao'];

export const mockChatrooms: ChatroomDiscoveryItem[] = [
  {
    id: 'laguna',
    name: 'Laguna',
    slug: 'laguna',
    about: 'Province-wide discussions and local updates from Laguna.',
    rules: ['Respect different views', 'No spam posts'],
    admins: ['LuzonAdmin'],
    memberCount: 1210,
    privacy: 'public',
    language: 'Filipino / English',
    tags: ['luzon', 'community', 'events'],
    category: 'Luzon',
    region: 'CALABARZON',
    createdAt: '2024-01-10T08:00:00.000Z',
    trendingScore: 97,
  },
  {
    id: 'bulacan',
    name: 'Bulacan',
    slug: 'bulacan',
    about: 'Community chat for residents of Bulacan province.',
    rules: ['Be helpful', 'Keep posts relevant to the province'],
    admins: ['LuzonMod'],
    memberCount: 980,
    privacy: 'public',
    language: 'Filipino',
    tags: ['luzon', 'community'],
    category: 'Luzon',
    region: 'Central Luzon',
    createdAt: '2024-02-01T09:15:00.000Z',
    trendingScore: 88,
  },
  {
    id: 'cavite',
    name: 'Cavite',
    slug: 'cavite',
    about: 'Provincial discussions, news, and local recommendations for Cavite.',
    rules: ['No harassment', 'No misinformation'],
    admins: ['CaviteCaptain'],
    memberCount: 1040,
    privacy: 'public',
    language: 'Filipino / English',
    tags: ['south-luzon', 'food', 'traffic'],
    category: 'Luzon',
    region: 'CALABARZON',
    createdAt: '2024-01-28T11:25:00.000Z',
    trendingScore: 91,
  },
  {
    id: 'cebu',
    name: 'Cebu',
    slug: 'cebu',
    about: 'Connect with people across Cebu province for travel, business, and daily life.',
    rules: ['Use respectful language', 'No buy/sell scams'],
    admins: ['VisayasLead'],
    memberCount: 1300,
    privacy: 'public',
    language: 'Cebuano / English',
    tags: ['visayas', 'tourism', 'business'],
    category: 'Visayas',
    region: 'Central Visayas',
    createdAt: '2024-02-14T13:40:00.000Z',
    trendingScore: 94,
  },
  {
    id: 'iloilo',
    name: 'Iloilo',
    slug: 'iloilo',
    about: 'A space for Iloilo province updates, advice, and meetups.',
    rules: ['Stay on-topic', 'No offensive language'],
    admins: ['IloiloHub'],
    memberCount: 760,
    privacy: 'public',
    language: 'Hiligaynon / English',
    tags: ['culture', 'local', 'events'],
    category: 'Visayas',
    region: 'Western Visayas',
    createdAt: '2024-03-03T07:35:00.000Z',
    trendingScore: 83,
  },
  {
    id: 'davao-del-sur',
    name: 'Davao del Sur',
    slug: 'davao-del-sur',
    about: 'Province-wide chat for Davao del Sur residents and visitors.',
    rules: ['Be civil', 'No political hate speech'],
    admins: ['MindanaoGuard'],
    memberCount: 990,
    privacy: 'public',
    language: 'Bisaya / Filipino',
    tags: ['mindanao', 'news', 'community'],
    category: 'Mindanao',
    region: 'Davao Region',
    createdAt: '2024-02-22T10:10:00.000Z',
    trendingScore: 89,
  },
  {
    id: 'bukidnon',
    name: 'Bukidnon',
    slug: 'bukidnon',
    about: 'A local room for Bukidnon province discussions and support.',
    rules: ['Respect local culture', 'No duplicated posts'],
    admins: ['BukidnonBase'],
    memberCount: 640,
    privacy: 'public',
    language: 'Binukid / Cebuano / English',
    tags: ['agriculture', 'local-life'],
    category: 'Mindanao',
    region: 'Northern Mindanao',
    createdAt: '2024-04-05T06:20:00.000Z',
    trendingScore: 80,
  },
];

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
  return rooms.filter((room) => ids.includes(room.id));
};
