import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '@/constants/design';
import { Chatroom } from '@/types/database.types';

type Props = {
  room: Chatroom;
  onPress: () => void;
  onSave?: () => void;
  saved?: boolean;
};

export function DiscoveryRoomCard({ room, onPress, onSave, saved }: Props) {
  const tags = room.tags || [];
  const about = room.description || 'No description yet.';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.titleRow}>
        <Text style={styles.name}>{room.name}</Text>
        {!!onSave && (
          <TouchableOpacity onPress={onSave}>
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? colors.accent : colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.meta}>#{room.category || 'General'} • {room.region || 'Unknown region'} • {room.type}</Text>
      <Text style={styles.about} numberOfLines={2}>{about}</Text>
      <View style={styles.footer}>
        <Text style={styles.members}>{room.member_count.toLocaleString()} members</Text>
        <View style={styles.tagsRow}>
          {tags.slice(0, 2).map((tag: string) => (
            <View key={tag} style={styles.tag}><Text style={styles.tagText}>#{tag}</Text></View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  name: { ...typography.h4, color: colors.text, flex: 1 },
  meta: { ...typography.small, color: colors.accent, marginTop: spacing.xs },
  about: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, alignItems: 'center' },
  members: { ...typography.smallBold, color: colors.textSecondary },
  tagsRow: { flexDirection: 'row', gap: spacing.xs },
  tag: { borderRadius: borderRadius.full, backgroundColor: colors.backgroundTertiary, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  tagText: { ...typography.tiny, color: colors.textSecondary },
});
