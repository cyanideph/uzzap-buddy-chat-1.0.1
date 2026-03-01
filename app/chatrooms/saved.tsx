import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { DiscoveryRoomCard } from '@/components/chatrooms/DiscoveryRoomCard';
import { colors, spacing, typography } from '@/constants/design';
import { getRoomsByIds, getSavedRoomIds, toggleSavedRoom } from '@/lib/chatroomDiscovery';

export default function SavedChatroomsScreen() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const loadSaved = async () => setSavedIds(await getSavedRoomIds());

  useEffect(() => {
    loadSaved();
  }, []);

  const { data: savedRooms = [], isLoading } = useQuery({
    queryKey: ['chatrooms', 'saved', savedIds],
    queryFn: () => getRoomsByIds(savedIds),
    enabled: savedIds.length > 0,
  });

  return (
    <Container>
      <Stack.Screen options={{ title: 'Saved Chatrooms' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            {savedRooms.length === 0 && <Text style={styles.empty}>No favorites saved yet.</Text>}
            {savedRooms.map((room) => (
              <DiscoveryRoomCard
                key={room.id}
                room={room as any}
                saved
                onPress={() => router.push(`/chatroom/${room.id}` as any)}
                onSave={async () => setSavedIds(await toggleSavedRoom(room.id))}
              />
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
