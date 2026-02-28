import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Card, Avatar, Container, Button, Input } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';

const REGIONS = ['All', 'Metro Manila', 'Luzon', 'Visayas', 'Mindanao', 'International'];

export default function ChatroomListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomRegion, setNewRoomRegion] = useState('Metro Manila');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: chatrooms, isLoading, refetch } = useQuery({
    queryKey: ['chatrooms', selectedRegion],
    queryFn: async () => {
      let query = supabase.from('rooms').select('*');
      if (selectedRegion !== 'All') {
        query = query.eq('region', selectedRegion);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleCreateRoom = async () => {
    if (!newRoomName || !newRoomRegion) {
      Alert.alert('Error', 'Please enter a room name and select a region');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.from('rooms').insert({
        name: newRoomName,
        region: newRoomRegion,
        description: newRoomDescription,
      }).select().single();

      if (error) throw error;

      setCreateModalVisible(false);
      setNewRoomName('');
      setNewRoomDescription('');
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
      router.push(`/chatroom/${data.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create chatroom');
    } finally {
      setCreating(false);
    }
  };

  const renderChatroom = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
      <Card
        variant="elevated"
        onPress={() => router.push(`/chatroom/${item.id}`)}
        style={styles.roomCard}
      >
        <Card.Content style={styles.roomContent}>
          <View style={styles.roomIcon}>
            <Ionicons name="chatbubble-ellipses" size={24} color={colors.accent} />
          </View>
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={styles.roomDescription} numberOfLines={1}>
              {item.description || 'Welcome to the room!'}
            </Text>
            <View style={styles.roomMeta}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.region}</Text>
              </View>
              <View style={styles.onlineCount}>
                <Ionicons name="people" size={14} color={colors.textTertiary} />
                <Text style={styles.onlineText}>Join Now</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.border} />
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionsContainer}
        >
          {REGIONS.map((region) => (
            <TouchableOpacity
              key={region}
              onPress={() => setSelectedRegion(region)}
              style={[
                styles.regionTab,
                selectedRegion === region && styles.regionTabActive,
              ]}
            >
              <Text
                style={[
                  styles.regionTabText,
                  selectedRegion === region && styles.regionTabTextActive,
                ]}
              >
                {region}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={chatrooms}
        renderItem={renderChatroom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={80} color={colors.border} />
              <Text style={styles.emptyTitle}>No chatrooms yet</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to create a room in {selectedRegion === 'All' ? 'any region' : selectedRegion}!
              </Text>
              <Button
                variant="primary"
                onPress={() => setCreateModalVisible(true)}
                style={styles.createButton}
              >
                Create Room
              </Button>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
      >
        <Ionicons name="add" size={32} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Chatroom</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="Room Name"
                placeholder="Enter room name"
                value={newRoomName}
                onChangeText={setNewRoomName}
              />
              
              <Text style={styles.label}>Region</Text>
              <View style={styles.regionsGrid}>
                {REGIONS.filter(r => r !== 'All').map((region) => (
                  <TouchableOpacity
                    key={region}
                    onPress={() => setNewRoomRegion(region)}
                    style={[
                      styles.regionOption,
                      newRoomRegion === region && styles.regionOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.regionOptionText,
                        newRoomRegion === region && styles.regionOptionTextActive,
                      ]}
                    >
                      {region}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Description (Optional)"
                placeholder="What's this room about?"
                value={newRoomDescription}
                onChangeText={setNewRoomDescription}
                multiline
              />

              <Button
                variant="primary"
                onPress={handleCreateRoom}
                loading={creating}
                style={styles.modalCreateBtn}
              >
                Create Room
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  regionsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  regionTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  regionTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.accent,
  },
  regionTabText: {
    ...typography.smallBold,
    color: colors.textSecondary,
  },
  regionTabTextActive: {
    color: colors.text,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  roomCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
  },
  roomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    ...typography.h4,
    color: colors.text,
  },
  roomDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    ...typography.tiny,
    color: colors.accent,
    fontWeight: '700',
  },
  onlineCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineText: {
    ...typography.tiny,
    color: colors.textTertiary,
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
  createButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 10,
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 44, 34, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalBody: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.smallBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  regionOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  regionOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.accent,
  },
  regionOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  regionOptionTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  modalCreateBtn: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
});
