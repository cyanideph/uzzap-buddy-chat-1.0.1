import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container } from '@/components/ui';
import { colors, borderRadius, spacing, typography } from '@/constants/design';
import { chatroomService } from '@/services/chatroomService';
import { Chatroom } from '@/types/database.types';

type GroupedRooms = {
  category: string;
  rooms: Chatroom[];
};

export default function ChatroomCategoriesScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      const result = await chatroomService.getChatrooms('discovery');
      setRooms(result);
      setLoading(false);
    };

    loadRooms();
  }, []);

  const groupedRooms = useMemo<GroupedRooms[]>(() => {
    const map = new Map<string, Chatroom[]>();

    rooms.forEach((room) => {
      const category = room.category || room.region || 'Uncategorized';
      map.set(category, [...(map.get(category) || []), room]);
    });

    return Array.from(map.entries())
      .map(([category, categoryRooms]) => ({
        category,
        rooms: categoryRooms,
      }))
      .sort((a, b) => b.rooms.length - a.rooms.length);
  }, [rooms]);

  return (
    <Container>
      <Stack.Screen options={{ title: 'Browse Categories' }} />
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {groupedRooms.map((group) => (
            <View key={group.category} style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>{group.category}</Text>
              <Text style={styles.categoryMeta}>{group.rooms.length} rooms</Text>
              {group.rooms.map((room) => (
                <TouchableOpacity key={room.id} style={styles.roomButton} onPress={() => router.push(`/chatroom/${room.id}` as any)}>
                  <Text style={styles.roomText}>{room.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {groupedRooms.length === 0 && <Text style={styles.empty}>No chatrooms found.</Text>}
        </ScrollView>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  categoryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    gap: spacing.xs,
  },
  categoryTitle: { ...typography.h4, color: colors.text },
  categoryMeta: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.xs },
  roomButton: {
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  roomText: { ...typography.caption, color: colors.text },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
});
