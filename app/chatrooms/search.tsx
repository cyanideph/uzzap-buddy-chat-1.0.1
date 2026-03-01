import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container, Input } from '@/components/ui';
import { DiscoveryRoomCard } from '@/components/chatrooms/DiscoveryRoomCard';
import { colors, spacing } from '@/constants/design';
import { searchChatrooms } from '@/lib/chatroomDiscovery';

export default function ChatroomSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchChatrooms(query), [query]);

  return (
    <Container>
      <Stack.Screen options={{ title: 'Global Chatroom Search' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Input value={query} onChangeText={setQuery} placeholder="Search all chatrooms, tags, regions..." clearable />
        {results.map((room) => (
          <DiscoveryRoomCard key={room.id} room={room} onPress={() => router.push(`/chatroom/${room.id}` as any)} />
        ))}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xxxl, backgroundColor: colors.background, gap: spacing.md },
});
