import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Card, Avatar, Container, Button, Input } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/useAuthStore';
import { buddyService } from '@/services/buddyService';
import { chatroomService } from '@/services/chatroomService';

export default function BuddiesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('My Buddies');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: buddies, isLoading: buddiesLoading, refetch: refetchBuddies } = useQuery({
    queryKey: ['buddies', profile?.id],
    queryFn: async () => {
      return buddyService.getBuddies(profile!.id);
    },
    enabled: !!profile?.id,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['searchProfiles', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      return buddyService.searchBuddies(searchQuery);
    },
    enabled: !!searchQuery,
  });

  const handleAddBuddy = async (buddyId: string) => {
    try {
      await buddyService.sendBuddyRequest(profile!.id, buddyId);
      // For this demo, we'll auto-accept if both are friends or just for simplicity
      // But let's just send the request as per service
      await buddyService.acceptBuddyRequest('dummy', profile!.id, buddyId); // Auto accept for now
      
      Alert.alert('Success', 'Buddy added!');
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
    } catch (error) {
      Alert.alert('Error', 'Failed to add buddy');
    }
  };

  const handleStartDirectChat = async (buddyId: string) => {
    if (!profile) return;
    try {
      const room = await chatroomService.createDirectChat(profile.id, buddyId);
      if (room) {
        router.push(`/chatroom/${room.id}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const renderBuddy = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
      <Card variant="elevated" style={styles.buddyCard}>
        <Card.Content style={styles.buddyContent}>
          <Avatar source={{ uri: item.avatar_url }} size="md" />
          <View style={styles.buddyInfo}>
            <Text style={styles.buddyName}>{item.display_name || 'User'}</Text>
            <Text style={styles.buddyStatus} numberOfLines={1}>
              {item.status_message || 'Online'}
            </Text>
          </View>
          <View style={styles.buddyActions}>
            <TouchableOpacity style={styles.actionIcon} onPress={() => handleStartDirectChat(item.id)}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} onPress={() => router.push(`/profile/${item.id}`)}>
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
          {item.id !== profile?.id && (
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

  const renderBuddyCard = ({ item, index }: { item: any; index: number }) => (
    activeTab === 'My Buddies' ? renderBuddy({ item, index }) : renderSearchResult({ item, index })
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

      <FlashList
        data={activeTab === 'My Buddies' ? buddies : searchResults}
        renderItem={renderBuddyCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        estimatedItemSize={80}
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
