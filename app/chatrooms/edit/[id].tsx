import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Container, Input } from '@/components/ui';
import { colors, borderRadius, spacing, typography } from '@/constants/design';
import { chatroomService } from '@/services/chatroomService';

export default function EditChatroomSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [about, setAbout] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadRoom = async () => {
      const room = await chatroomService.getChatroomById(id);
      if (!room) return;

      setAbout(room.description || '');
      setTags((room.tags || []).join(', '));
    };

    loadRoom();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    const nextTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const updated = await chatroomService.updateChatroom(id, {
      description: about.trim(),
      tags: nextTags,
    });

    setSaving(false);

    if (!updated) {
      Alert.alert('Update failed', 'Unable to save room settings right now.');
      return;
    }

    Alert.alert('Settings saved', 'Room settings were updated.');
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Edit Chatroom Settings' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.meta}>Owner / Moderator tools</Text>
        <Input label="About" value={about} onChangeText={setAbout} multiline />
        <Input label="Tags (comma separated)" value={tags} onChangeText={setTags} multiline />
        <TouchableOpacity style={[styles.save, saving && styles.saveDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  meta: { ...typography.caption, color: colors.accent },
  save: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' },
  saveDisabled: { opacity: 0.6 },
  saveText: { ...typography.bodyBold, color: colors.white },
});
