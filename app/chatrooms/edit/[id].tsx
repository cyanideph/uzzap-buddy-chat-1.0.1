import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Container, Input } from '@/components/ui';
import { colors, borderRadius, spacing, typography } from '@/constants/design';
import { mockChatrooms } from '@/lib/chatroomDiscovery';

export default function EditChatroomSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const room = useMemo(() => mockChatrooms.find((item) => item.id === id), [id]);

  const [about, setAbout] = useState(room?.about || '');
  const [rules, setRules] = useState(room?.rules.join('\n') || '');

  return (
    <Container>
      <Stack.Screen options={{ title: 'Edit Chatroom Settings' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.meta}>Owner / Moderator tools</Text>
        <Input label="About" value={about} onChangeText={setAbout} multiline />
        <Input label="Rules (one per line)" value={rules} onChangeText={setRules} multiline />
        <TouchableOpacity style={styles.save} onPress={() => Alert.alert('Settings saved', 'Room settings were updated locally.') }>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  meta: { ...typography.caption, color: colors.accent },
  save: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' },
  saveText: { ...typography.bodyBold, color: colors.white },
});
