import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const mockChatrooms: ChatroomDiscoveryItem[] = [
  {
    id: 'cb-1',
    name: 'Manila Basketball Hub',
    slug: 'manila-basketball-hub',
    about: 'Pickup games, NBA talk, and local league updates around Metro Manila.',
    rules: ['Be respectful', 'No spam links', 'Keep chats sports-related'],
    admins: ['CoachMigs', 'Alyssa'],
    memberCount: 1842,
    privacy: 'public',
    language: 'English / Filipino',
    tags: ['basketball', 'nba', 'pickup'],
    category: 'Sports',
    region: 'Metro Manila',
    createdAt: '2026-01-05T10:00:00.000Z',
    trendingScore: 98,
  },
  {
    id: 'cb-2',
    name: 'Valorant PH Ranked',
    slug: 'valorant-ph-ranked',
    about: 'Find party members, share clips, and queue with fellow competitive players.',
    rules: ['No toxicity', 'Use LFG channels', 'No account selling'],
    admins: ['JettMain', 'CypherPH'],
    memberCount: 1290,
    privacy: 'public',
    language: 'English',
    tags: ['fps', 'valorant', 'esports'],
    category: 'Gaming',
    region: 'National',
    createdAt: '2026-02-12T12:30:00.000Z',
    trendingScore: 96,
  },
  {
    id: 'cb-3',
    name: 'UP Study Sprint',
    slug: 'up-study-sprint',
    about: 'Focused pomodoro rooms, accountability buddies, and exam prep sessions.',
    rules: ['Respect focus time', 'No hate speech', 'Use topic channels'],
    admins: ['Kai', 'Mina'],
    memberCount: 860,
    privacy: 'private',
    language: 'English',
    tags: ['pomodoro', 'students', 'review'],
    category: 'Study',
    region: 'Quezon City',
    createdAt: '2026-02-20T08:15:00.000Z',
    trendingScore: 90,
  },
  {
    id: 'cb-4',
    name: 'Cebu Dev Circle',
    slug: 'cebu-dev-circle',
    about: 'Discuss web/mobile engineering, startup life, and weekend code jams.',
    rules: ['No job scams', 'Keep it constructive', 'Use thread tags'],
    admins: ['Nico', 'Tess'],
    memberCount: 540,
    privacy: 'public',
    language: 'English',
    tags: ['react', 'mobile', 'startup'],
    category: 'Tech',
    region: 'Cebu',
    createdAt: '2026-02-26T17:40:00.000Z',
    trendingScore: 84,
  },
  {
    id: 'cb-5',
    name: 'OPM Songwriters Corner',
    slug: 'opm-songwriters-corner',
    about: 'Share demos, request feedback, and collaborate on original tracks.',
    rules: ['Credit collaborators', 'No piracy', 'Constructive feedback only'],
    admins: ['Yssa', 'Rico'],
    memberCount: 402,
    privacy: 'public',
    language: 'Filipino / English',
    tags: ['opm', 'songwriting', 'music'],
    category: 'Music',
    region: 'National',
    createdAt: '2026-02-27T15:00:00.000Z',
    trendingScore: 80,
  },
  {
    id: 'cb-6',
    name: 'Career Launchpad PH',
    slug: 'career-launchpad-ph',
    about: 'Mock interviews, resume swaps, and internship opportunities.',
    rules: ['No paid referrals', 'Protect private data', 'Give actionable advice'],
    admins: ['HRMia', 'Gelo'],
    memberCount: 990,
    privacy: 'private',
    language: 'English',
    tags: ['jobs', 'resume', 'interview'],
    category: 'Career',
    region: 'National',
    createdAt: '2026-01-30T07:45:00.000Z',
    trendingScore: 88,
  },
];

export const getDiscoverRooms = (tab: DiscoveryTab) => {
  if (tab === 'new') {
    return [...mockChatrooms].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  if (tab === 'nearby') {
    const nearbyRank = ['Metro Manila', 'Quezon City', 'Cebu'];
    return [...mockChatrooms].sort((a, b) => nearbyRank.indexOf(a.region) - nearbyRank.indexOf(b.region));
  }

  return [...mockChatrooms].sort((a, b) => b.trendingScore - a.trendingScore);
};

export const searchChatrooms = (query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return mockChatrooms.filter((room) =>
    [room.name, room.about, room.category, room.region, room.tags.join(' ')].join(' ').toLowerCase().includes(normalized),
  );
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

export const getRoomsByIds = (ids: string[]) => ids.map((id) => mockChatrooms.find((room) => room.id === id)).filter(Boolean) as ChatroomDiscoveryItem[];
