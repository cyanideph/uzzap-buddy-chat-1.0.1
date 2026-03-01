import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui';
import { colors, borderRadius, spacing, typography } from '@/constants/design';
import { mockChatrooms } from '@/lib/chatroomDiscovery';

export default function ChatroomMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const room = useMemo(() => mockChatrooms.find((item) => item.id === id), [id]);

  const members = useMemo(() => {
    const admins = room?.admins.map((admin) => ({ name: admin, role: 'Admin' })) || [];
    const generated = Array.from({ length: 12 }).map((_, idx) => ({ name: `member_${idx + 1}`, role: 'Member' }));
    return [...admins, ...generated];
  }, [room]);

  return (
    <Container>
      <Stack.Screen options={{ title: 'Members' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {members.map((member) => (
          <View key={member.name} style={styles.row}>
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.role}>{member.role}</Text>
          </View>
        ))}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.sm },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: { ...typography.body, color: colors.text },
  role: { ...typography.smallBold, color: colors.accent },
});
