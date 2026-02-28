import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Card, Avatar, Container, Button, Input } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';

export default function BuddiesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('My Buddies');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: buddies, isLoading: buddiesLoading, refetch: refetchBuddies } = useQuery({
    queryKey: ['buddies', user?.id],
    queryFn: async () => {
      const { data: results, error: buddyError } = await supabase
        .from('buddies')
        .select('*, profile:buddy_id(id, display_name, avatar_url, status_message, region)')
        .eq('user_id', user!.id)
        .eq('status', 'accepted');

      if (buddyError) throw buddyError;
      return results;
    },
    enabled: !!user?.id,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['searchProfiles', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('display_name', `%${searchQuery}%`);
      
      if (error) throw error;
      return data;
    },
    enabled: !!searchQuery,
  });

  const handleAddBuddy = async (buddyId: string) => {
    try {
      const { data: exists, error: checkError } = await supabase
        .from('buddies')
        .select('id')
        .eq('user_id', user!.id)
        .eq('buddy_id', buddyId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (exists) {
        Alert.alert('Info', 'Buddy request already sent or already buddies');
        return;
      }

      const { error: addError } = await supabase.from('buddies').insert([
        {
          user_id: user!.id,
          buddy_id: buddyId,
          status: 'accepted',
        },
        {
          user_id: buddyId,
          buddy_id: user!.id,
          status: 'accepted',
        }
      ]);

      if (addError) throw addError;

      Alert.alert('Success', 'Buddy added!');
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
    } catch (error) {
      Alert.alert('Error', 'Failed to add buddy');
    }
  };

  const renderBuddy = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
      <Card variant="elevated" style={styles.buddyCard}>
        <Card.Content style={styles.buddyContent}>
          <Avatar source={{ uri: item.profile?.avatar_url }} size="md" />
          <View style={styles.buddyInfo}>
            <Text style={styles.buddyName}>{item.profile?.display_name || 'User'}</Text>
            <Text style={styles.buddyStatus} numberOfLines={1}>
              {item.profile?.status_message || 'Online'}
            </Text>
          </View>
          <View style={styles.buddyActions}>
            <TouchableOpacity style={styles.actionIcon} onPress={() => Alert.alert('Chat', 'Direct messaging coming soon!')}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} onPress={() => router.push(`/profile/${item.buddy_id}`)}>
              <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderSearchResult = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
      <Card variant="elevated" style={styles.buddyCard}>
        <Card.Content style={styles.buddyContent}>
          <Avatar source={{ uri: item.avatar_url }} size="md" />
          <View style={styles.buddyInfo}>
            <Text style={styles.buddyName}>{item.display_name || 'User'}</Text>
            <Text style={styles.buddyStatus} numberOfLines={1}>{item.region}</Text>
          </View>
          {item.user_id !== user.id && (
            <Button
              variant="primary"
              size="sm"
              onPress={() => handleAddBuddy(item.id)}
              style={styles.addBtn}
            >
              Add
            </Button>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab('My Buddies')}
            style={[styles.tab, activeTab === 'My Buddies' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'My Buddies' && styles.activeTabText]}>My Buddies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('Find Buddies')}
            style={[styles.tab, activeTab === 'Find Buddies' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'Find Buddies' && styles.activeTabText]}>Find Buddies</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Find Buddies' && (
          <View style={styles.searchBar}>
            <Input
              placeholder="Search buddies by name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Ionicons name="search" size={20} color={colors.textTertiary} />}
              clearable
            />
          </View>
        )}
      </View>

      <FlatList
        data={activeTab === 'My Buddies' ? buddies : searchResults}
        renderItem={activeTab === 'My Buddies' ? renderBuddy : renderSearchResult}
        keyExtractor={(item) => (activeTab === 'My Buddies' ? item.id : item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          activeTab === 'My Buddies' ? (
            <RefreshControl refreshing={buddiesLoading} onRefresh={refetchBuddies} tintColor={colors.accent} />
          ) : undefined
        }
        ListEmptyComponent={
          !buddiesLoading && !searchLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name={activeTab === 'My Buddies' ? 'people-outline' : 'search-outline'}
                size={80}
                color={colors.border}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'My Buddies' ? 'No buddies yet' : 'Search for buddies'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'My Buddies'
                  ? 'Start by finding new buddies and sending requests!'
                  : 'Enter a name in the search bar to find people to chat with.'}
              </Text>
            </View>
          ) : null
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: {
    flexDirection: 'row',
    padding: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.smallBold,
    color: colors.textTertiary,
  },
  activeTabText: {
    color: colors.text,
  },
  searchBar: {
    padding: spacing.md,
    paddingTop: 0,
  },
  listContent: {
    padding: spacing.md,
  },
  buddyCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  buddyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  buddyInfo: {
    flex: 1,
  },
  buddyName: {
    ...typography.h4,
    color: colors.text,
  },
  buddyStatus: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  buddyActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    paddingHorizontal: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xxl,
  },
});
