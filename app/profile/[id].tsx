import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container, Avatar, Card, Button } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: buddyStatus } = useQuery({
    queryKey: ['buddyStatus', id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      const { data, error } = await supabase
        .from('buddies')
        .select('status')
        .eq('user_id', currentUser.id)
        .eq('buddy_id', id)
        .maybeSingle();
      
      if (error) return null;
      return data?.status || null;
    },
    enabled: !!currentUser && !!id,
  });

  const handleAddBuddy = async () => {
    if (!currentUser || !id) return;

    try {
      const { error } = await supabase.from('buddies').insert([
        {
          user_id: currentUser.id,
          buddy_id: id,
          status: 'accepted',
        },
        {
          user_id: id,
          buddy_id: currentUser.id,
          status: 'accepted',
        }
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Buddy added!');
      queryClient.invalidateQueries({ queryKey: ['buddyStatus', id] });
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
    } catch (error) {
      Alert.alert('Error', 'Failed to add buddy');
    }
  };

  if (isLoading) {
    return (
      <Container style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Profile' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar source={{ uri: profile?.avatar_url }} size="xl" />
          <Text style={styles.userName}>{profile?.display_name || 'Buddy'}</Text>
          <Text style={styles.userRegion}>{profile?.region || 'International'}</Text>
          
          {id !== currentUser?.id && (
            <View style={styles.actions}>
              {buddyStatus === 'accepted' ? (
                <Button
                  variant="outline"
                  leftIcon={<Ionicons name="chatbubble-outline" size={20} color={colors.primary} />}
                  onPress={() => Alert.alert('Chat', 'Direct messaging coming soon!')}
                  style={styles.actionBtn}
                >
                  Message
                </Button>
              ) : (
                <Button
                  variant="primary"
                  leftIcon={<Ionicons name="person-add-outline" size={20} color={colors.white} />}
                  onPress={handleAddBuddy}
                  style={styles.actionBtn}
                >
                  Add Buddy
                </Button>
              )}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Card variant="elevated" style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoLabel}>Status Message</Text>
              <Text style={styles.infoValue}>
                {profile?.status_message || 'No status message set.'}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    ...shadows.md,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  userRegion: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionBtn: {
    minWidth: 140,
  },
  content: {
    padding: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.backgroundSecondary,
  },
  infoLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
  },
});
