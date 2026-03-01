import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { Container } from '@/components/ui';
import { colors, borderRadius, spacing, typography } from '@/constants/design';

const pendingRequests = [
  { id: 'rq-1', roomName: 'UP Study Sprint', requester: 'sam.reyes', note: 'Looking for accountability partners.' },
  { id: 'rq-2', roomName: 'Career Launchpad PH', requester: 'nina.dev', note: 'Need interview prep and resume feedback.' },
];

export default function JoinRequestsScreen() {
  return (
    <Container>
      <Stack.Screen options={{ title: 'Join Requests' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {pendingRequests.map((request) => (
          <View key={request.id} style={styles.card}>
            <Text style={styles.room}>{request.roomName}</Text>
            <Text style={styles.requester}>@{request.requester}</Text>
            <Text style={styles.note}>{request.note}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.action, styles.decline]} onPress={() => Alert.alert('Declined request')}>
                <Text style={styles.actionText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.action, styles.approve]} onPress={() => Alert.alert('Approved request')}>
                <Text style={styles.actionText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
  },
  room: { ...typography.h4, color: colors.text },
  requester: { ...typography.smallBold, color: colors.accent, marginTop: spacing.xs },
  note: { ...typography.caption, color: colors.textSecondary, marginVertical: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1, borderRadius: borderRadius.md, alignItems: 'center', paddingVertical: spacing.sm },
  decline: { backgroundColor: colors.backgroundTertiary },
  approve: { backgroundColor: colors.primary },
  actionText: { ...typography.smallBold, color: colors.text },
});
