import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container, Input } from '@/components/ui';
import { colors, borderRadius, spacing, typography } from '@/constants/design';
import { DiscoveryRoomCard } from '@/components/chatrooms/DiscoveryRoomCard';
import { discoveryTabs, DiscoveryTab, getDiscoverRooms, getSavedRoomIds, markRoomVisited, toggleSavedRoom } from '@/lib/chatroomDiscovery';

const shortcuts = [
  { label: 'Categories', route: '/chatrooms/categories' },
  { label: 'Global Search', route: '/chatrooms/search' },
  { label: 'Saved Rooms', route: '/chatrooms/saved' },
  { label: 'Recent Visits', route: '/chatrooms/recent' },
  { label: 'Join Requests', route: '/chatrooms/join-requests' },
  { label: 'Create Advanced', route: '/chatrooms/create' },
] as const;

export default function ChatroomDiscoverScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('trending');
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    getSavedRoomIds().then(setSavedIds);
  }, []);

  const rooms = useMemo(() => {
    const base = getDiscoverRooms(activeTab);
    const normalized = search.trim().toLowerCase();

    if (!normalized) return base;

    return base.filter((room) => `${room.name} ${room.about} ${room.tags.join(' ')}`.toLowerCase().includes(normalized));
  }, [activeTab, search]);

  return (
    <Container>
      <Stack.Screen options={{ title: 'Explore Chatrooms' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heroTitle}>Discovery & Growth</Text>
        <Text style={styles.heroSubtitle}>Explore trending, newly created, and nearby communities.</Text>

        <Input placeholder="Filter rooms" value={search} onChangeText={setSearch} clearable />

        <View style={styles.tabRow}>
          {discoveryTabs.map((tab) => (
            <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key)}>
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.shortcutGrid}>
          {shortcuts.map((shortcut) => (
            <TouchableOpacity key={shortcut.route} style={styles.shortcut} onPress={() => router.push(shortcut.route as any)}>
              <Text style={styles.shortcutText}>{shortcut.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {rooms.map((room) => (
          <DiscoveryRoomCard
            key={room.id}
            room={room}
            saved={savedIds.includes(room.id)}
            onSave={async () => {
              const next = await toggleSavedRoom(room.id);
              setSavedIds(next);
            }}
            onPress={async () => {
              await markRoomVisited(room.id);
              router.push(`/chatroom/${room.id}` as any);
            }}
          />
        ))}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.md },
  heroTitle: { ...typography.h2, color: colors.text },
  heroSubtitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  tabRow: { flexDirection: 'row', gap: spacing.sm },
  tab: {
    flex: 1,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { ...typography.smallBold, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  shortcutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  shortcut: {
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
  },
  shortcutText: { ...typography.smallBold, color: colors.text },
});
