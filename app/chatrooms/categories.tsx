import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container } from '@/components/ui';
import { categories, mockChatrooms } from '@/lib/chatroomDiscovery';
import { colors, borderRadius, spacing, typography } from '@/constants/design';

export default function ChatroomCategoriesScreen() {
  const router = useRouter();

  return (
    <Container>
      <Stack.Screen options={{ title: 'Browse Categories' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {categories.map((category) => {
          const rooms = mockChatrooms.filter((room) => room.category === category);
          return (
            <View key={category} style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <Text style={styles.categoryMeta}>{rooms.length} rooms</Text>
              {rooms.map((room) => (
                <TouchableOpacity key={room.id} style={styles.roomButton} onPress={() => router.push(`/chatroom/${room.id}` as any)}>
                  <Text style={styles.roomText}>{room.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
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
});
