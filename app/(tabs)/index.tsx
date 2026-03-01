import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, ScrollView, Modal, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Card, Container, Button, Input } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';

type ChatroomItem = {
  id: string;
  name: string;
  description?: string | null;
  region?: string | null;
  province?: string | null;
};

const PHILIPPINES_REGIONS: Record<string, string[]> = {
  'NCR (Metro Manila)': [
    'Caloocan',
    'Las Piñas',
    'Makati',
    'Malabon',
    'Mandaluyong',
    'Manila',
    'Marikina',
    'Muntinlupa',
    'Navotas',
    'Parañaque',
    'Pasay',
    'Pasig',
    'Quezon City',
    'San Juan',
    'Taguig',
    'Valenzuela',
    'Pateros',
  ],
  'CAR (Cordillera Administrative Region)': ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'],
  'Region I (Ilocos Region)': ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'],
  'Region II (Cagayan Valley)': ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'],
  'Region III (Central Luzon)': ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'],
  'Region IV-A (CALABARZON)': ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'],
  'Region IV-B (MIMAROPA)': ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'],
  'Region V (Bicol Region)': ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'],
  'Region VI (Western Visayas)': ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental'],
  'Region VII (Central Visayas)': ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor'],
  'Region VIII (Eastern Visayas)': ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'],
  'Region IX (Zamboanga Peninsula)': ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
  'Region X (Northern Mindanao)': ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'],
  'Region XI (Davao Region)': ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'],
  'Region XII (SOCCSKSARGEN)': ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'],
  'Region XIII (Caraga)': ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'],
  'BARMM': ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Sulu', 'Tawi-Tawi', 'Cotabato City'],
};

const REGION_OPTIONS = ['All Regions', ...Object.keys(PHILIPPINES_REGIONS)];

const PROVINCE_TO_REGION = Object.entries(PHILIPPINES_REGIONS).reduce<Record<string, string>>((acc, [region, provinces]) => {
  provinces.forEach((province) => {
    acc[province.toLowerCase()] = region;
  });
  return acc;
}, {});

const parseRoomLocation = (room: ChatroomItem) => {
  const description = room.description || '';
  const match = description.match(/^(.+?)\s*>\s*(.+?)(?::\s*|$)/);

  if (room.region && room.province) {
    return { region: room.region, province: room.province };
  }

  if (room.region && !room.province) {
    return { region: room.region, province: 'Unspecified Province' };
  }

  if (match) {
    return { region: match[1].trim(), province: match[2].trim() };
  }

  const fallbackRegion = Object.keys(PHILIPPINES_REGIONS).find((region) => room.name.includes(region));
  if (fallbackRegion) {
    return { region: fallbackRegion, province: 'Unspecified Province' };
  }

  const matchingProvince = Object.keys(PROVINCE_TO_REGION).find((province) =>
    `${room.name} ${description}`.toLowerCase().includes(province),
  );

  if (matchingProvince) {
    return { region: PROVINCE_TO_REGION[matchingProvince], province: matchingProvince };
  }

  return { region: 'Uncategorized', province: 'Unspecified Province' };
};

export default function ChatroomListScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { chatrooms, fetchChatrooms, isLoading } = useChatStore();

  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [searchQuery, setSearchQuery] = useState('');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'region' | 'province'>('region');

  const [newRoomRegion, setNewRoomRegion] = useState('Region IV-A (CALABARZON)');
  const [newRoomProvince, setNewRoomProvince] = useState('Batangas');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchChatrooms();
  }, [fetchChatrooms]);

  const regionProvinces = useMemo(
    () => ['All Provinces', ...(selectedRegion === 'All Regions' ? [] : PHILIPPINES_REGIONS[selectedRegion] || [])],
    [selectedRegion],
  );

  const createRegionProvinces = PHILIPPINES_REGIONS[newRoomRegion] || [];

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredChatrooms = (chatrooms as ChatroomItem[]).filter((room) => {
    const location = parseRoomLocation(room);
    const regionMatch = selectedRegion === 'All Regions' || location.region === selectedRegion;
    const provinceMatch = selectedProvince === 'All Provinces' || location.province.toLowerCase() === selectedProvince.toLowerCase();

    if (!normalizedSearch) return regionMatch && provinceMatch;

    return (
      regionMatch
      && provinceMatch
      && `${room.name} ${room.description || ''} ${location.region} ${location.province}`.toLowerCase().includes(normalizedSearch)
    );
  });

  const openPicker = (type: 'region' | 'province') => {
    setPickerType(type);
    setPickerModalVisible(true);
  };

  const applyRegion = (region: string) => {
    setSelectedRegion(region);
    setSelectedProvince('All Provinces');
    setPickerModalVisible(false);
  };

  const handleCreateRoom = async () => {
    if (!profile || !newRoomRegion || !newRoomProvince) {
      Alert.alert('Error', 'Please choose a region and province.');
      return;
    }

    const finalRoomName = newRoomName.trim() || `${newRoomProvince} Community`;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('chatrooms')
        .insert({
          name: finalRoomName,
          slug: `${finalRoomName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}-${Date.now()}`,
          description: `${newRoomRegion} > ${newRoomProvince}${newRoomDescription ? `: ${newRoomDescription}` : ''}`,
          type: 'public',
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCreateModalVisible(false);
      setNewRoomDescription('');
      setNewRoomName('');
      fetchChatrooms();
      router.push(`/chatroom/${data.id}`);
    } catch {
      Alert.alert('Error', 'Failed to create chatroom. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const renderChatroom = ({ item, index }: { item: ChatroomItem; index: number }) => {
    const location = parseRoomLocation(item);

    return (
      <Animated.View entering={FadeInUp.delay(index * 80).duration(450)}>
        <Card variant="elevated" onPress={() => router.push(`/chatroom/${item.id}`)} style={styles.roomCard}>
          <Card.Content style={styles.roomContent}>
            <View style={styles.roomIcon}>
              <Ionicons name="location" size={20} color={colors.accent} />
            </View>

            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.roomLocation}>{location.province} • {location.region}</Text>
              <Text style={styles.roomDescription} numberOfLines={1}>
                {item.description || 'Provincial community chatroom'}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Philippines Chatrooms</Text>
          <Text style={styles.heroSubtitle}>Choose a region, pick a province, and join local conversations faster.</Text>
          <View style={styles.heroStats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Object.keys(PHILIPPINES_REGIONS).length}</Text>
              <Text style={styles.statLabel}>Regions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{filteredChatrooms.length}</Text>
              <Text style={styles.statLabel}>Matching rooms</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Input
            placeholder="Search by room, region, or province"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Ionicons name="search" size={18} color={colors.textTertiary} />}
            clearable
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionsContainer}>
          {REGION_OPTIONS.map((region) => (
            <TouchableOpacity
              key={region}
              onPress={() => applyRegion(region)}
              style={[styles.regionTab, selectedRegion === region && styles.regionTabActive]}
            >
              <Text style={[styles.regionTabText, selectedRegion === region && styles.regionTabTextActive]}>{region}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => openPicker('region')}>
            <Text style={styles.filterLabel}>Region</Text>
            <Text style={styles.filterValue} numberOfLines={1}>{selectedRegion}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, selectedRegion === 'All Regions' && styles.filterBtnDisabled]}
            onPress={() => openPicker('province')}
            disabled={selectedRegion === 'All Regions'}
          >
            <Text style={styles.filterLabel}>Province</Text>
            <Text style={styles.filterValue} numberOfLines={1}>{selectedProvince}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlashList
        data={filteredChatrooms}
        renderItem={renderChatroom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchChatrooms} tintColor={colors.accent} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={76} color={colors.border} />
              <Text style={styles.emptyTitle}>No rooms in this filter yet</Text>
              <Text style={styles.emptySubtitle}>Try another province or create the first chatroom for your local area.</Text>
              <Button variant="primary" onPress={() => setCreateModalVisible(true)} style={styles.createButton}>
                Create Provincial Room
              </Button>
            </View>
          ) : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setCreateModalVisible(true)}>
        <Ionicons name="add" size={30} color={colors.text} />
      </TouchableOpacity>

      <Modal visible={createModalVisible} animationType="slide" transparent onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Provincial Chatroom</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Region</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionsContainer}>
                {Object.keys(PHILIPPINES_REGIONS).map((region) => (
                  <TouchableOpacity
                    key={region}
                    onPress={() => {
                      setNewRoomRegion(region);
                      setNewRoomProvince(PHILIPPINES_REGIONS[region][0]);
                    }}
                    style={[styles.regionOption, newRoomRegion === region && styles.regionOptionActive]}
                  >
                    <Text style={[styles.regionOptionText, newRoomRegion === region && styles.regionOptionTextActive]}>{region}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Province / City</Text>
              <View style={styles.provinceGrid}>
                {createRegionProvinces.map((province) => (
                  <TouchableOpacity
                    key={province}
                    onPress={() => setNewRoomProvince(province)}
                    style={[styles.provinceOption, newRoomProvince === province && styles.provinceOptionActive]}
                  >
                    <Text style={[styles.provinceOptionText, newRoomProvince === province && styles.provinceOptionTextActive]}>{province}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Room Name (optional)"
                placeholder={`${newRoomProvince} Community`}
                value={newRoomName}
                onChangeText={setNewRoomName}
              />

              <Input
                label="Description (optional)"
                placeholder="Introduce your local room"
                value={newRoomDescription}
                onChangeText={setNewRoomDescription}
                multiline
              />

              <Button variant="primary" onPress={handleCreateRoom} loading={creating} style={styles.modalCreateBtn}>
                Create Room
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={pickerModalVisible} animationType="fade" transparent onRequestClose={() => setPickerModalVisible(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>{pickerType === 'region' ? 'Choose Region' : 'Choose Province'}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.pickerList}>
              {(pickerType === 'region' ? REGION_OPTIONS : regionProvinces).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    if (pickerType === 'region') {
                      applyRegion(option);
                    } else {
                      setSelectedProvince(option);
                      setPickerModalVisible(false);
                    }
                  }}
                  style={styles.pickerItem}
                >
                  <Text style={styles.pickerText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button variant="ghost" onPress={() => setPickerModalVisible(false)}>Close</Button>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hero: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  heroTitle: { ...typography.h3, color: colors.text },
  heroSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  heroStats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  statCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  statValue: { ...typography.h4, color: colors.accent },
  statLabel: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  searchWrap: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  regionsContainer: { paddingHorizontal: spacing.md, gap: spacing.sm },
  regionTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  regionTabActive: { backgroundColor: colors.primary, borderColor: colors.accent },
  regionTabText: { ...typography.smallBold, color: colors.textSecondary },
  regionTabTextActive: { color: colors.text },
  filterRow: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  filterBtnDisabled: { opacity: 0.55 },
  filterLabel: { ...typography.tiny, color: colors.textTertiary },
  filterValue: { ...typography.smallBold, color: colors.text, marginTop: 2 },
  listContent: { padding: spacing.md, paddingBottom: 100 },
  roomCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
  },
  roomContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  roomIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: { flex: 1 },
  roomName: { ...typography.h4, color: colors.text },
  roomLocation: { ...typography.small, color: colors.accent, marginTop: 2 },
  roomDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xxl,
  },
  createButton: { marginTop: spacing.xl, paddingHorizontal: spacing.xl },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 10,
    zIndex: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 44, 34, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.h2, color: colors.text, flex: 1, marginRight: spacing.md },
  modalBody: { marginBottom: spacing.md },
  label: {
    ...typography.smallBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  regionOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  regionOptionActive: { backgroundColor: colors.primary, borderColor: colors.accent },
  regionOptionText: { ...typography.caption, color: colors.textSecondary },
  regionOptionTextActive: { color: colors.text, fontWeight: '700' },
  provinceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  provinceOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  provinceOptionActive: { backgroundColor: colors.backgroundTertiary, borderColor: colors.accent },
  provinceOptionText: { ...typography.caption, color: colors.textSecondary },
  provinceOptionTextActive: { color: colors.text, fontWeight: '700' },
  modalCreateBtn: { marginTop: spacing.lg, marginBottom: spacing.xl },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.md },
  pickerList: { marginBottom: spacing.md },
  pickerItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerText: { ...typography.body, color: colors.text },
});
