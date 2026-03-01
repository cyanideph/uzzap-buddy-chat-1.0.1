import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { DiscoveryRoomCard } from '@/components/chatrooms/DiscoveryRoomCard';
import { colors, spacing, typography } from '@/constants/design';
import { getRecentRoomIds, getRoomsByIds } from '@/lib/chatroomDiscovery';

export default function RecentChatroomsScreen() {
  const router = useRouter();
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    getRecentRoomIds().then(setRecentIds);
  }, []);

  const { data: recentRooms = [], isLoading } = useQuery({
    queryKey: ['chatrooms', 'recent', recentIds],
    queryFn: () => getRoomsByIds(recentIds),
    enabled: recentIds.length > 0,
  });

  return (
    <Container>
      <Stack.Screen options={{ title: 'Recently Visited' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            {recentRooms.length === 0 && <Text style={styles.empty}>Rooms you open will appear here.</Text>}
            {recentRooms.map((room) => (
              <DiscoveryRoomCard key={room.id} room={room as any} onPress={() => router.push(`/chatroom/${room.id}` as any)} />
            ))}
          </>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xxxl },
  empty: { ...typography.caption, color: colors.textSecondary },
});
