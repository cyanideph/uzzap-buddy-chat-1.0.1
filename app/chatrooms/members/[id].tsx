import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui';
import { colors, borderRadius, spacing, typography } from '@/constants/design';
import { chatroomService } from '@/services/chatroomService';

type MemberItem = {
  id: string;
  name: string;
  role: string;
};

export default function ChatroomMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadMembers = async () => {
      setLoading(true);
      const participants = await chatroomService.getChatroomParticipants(id);
      const parsedMembers = participants.map((participant) => ({
        id: participant.profile.id,
        name: participant.profile.display_name || participant.profile.username,
        role: participant.role === 'admin' ? 'Admin' : 'Member',
      }));

      setMembers(parsedMembers);
      setLoading(false);
    };

    loadMembers();
  }, [id]);

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name)),
    [members]
  );

  return (
    <Container>
      <Stack.Screen options={{ title: 'Members' }} />
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {sortedMembers.map((member) => (
            <View key={member.id} style={styles.row}>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.role}>{member.role}</Text>
            </View>
          ))}

          {sortedMembers.length === 0 && <Text style={styles.empty}>No members found.</Text>}
        </ScrollView>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.sm },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
});
