import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container, Input } from '@/components/ui';
import { categories } from '@/lib/chatroomDiscovery';
import { colors, borderRadius, spacing, typography } from '@/constants/design';
import { chatroomService } from '@/services/chatroomService';
import { useAuthStore } from '@/store/useAuthStore';

const languages = ['English', 'Filipino', 'Bisaya'];

export default function AdvancedCreateChatroomScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [language, setLanguage] = useState(languages[0]);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a room');
      return;
    }

    setLoading(true);
    try {
      const room = await chatroomService.createChatroom({
        name: name.trim(),
        description: description.trim(),
        type: privacy === 'public' ? 'discovery' : 'private',
        category: selectedCategory,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        language,
        userId: user.id
      });

      if (room) {
        Alert.alert('Success', 'Chatroom created successfully!');
        router.replace(`/chatroom/${room.id}` as any);
      } else {
        Alert.alert('Error', 'Failed to create chatroom');
      }
    } catch (error) {
      console.error('Create room error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Create Chatroom (Advanced)' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Room Name" value={name} onChangeText={setName} placeholder="e.g. Friday Night Gamers" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Tell people what this room is about..." multiline numberOfLines={3} />
        <Input label="Tags" value={tags} onChangeText={setTags} placeholder="gaming, squad, fps" />

        <Text style={styles.label}>Category</Text>
        <View style={styles.wrap}>
          {categories.map((category) => (
            <TouchableOpacity key={category} style={[styles.choice, selectedCategory === category && styles.choiceActive]} onPress={() => setSelectedCategory(category)}>
              <Text style={styles.choiceText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Language</Text>
        <View style={styles.wrap}>
          {languages.map((item) => (
            <TouchableOpacity key={item} style={[styles.choice, language === item && styles.choiceActive]} onPress={() => setLanguage(item)}>
              <Text style={styles.choiceText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Privacy</Text>
        <View style={styles.wrap}>
          {(['public', 'private'] as const).map((item) => (
            <TouchableOpacity key={item} style={[styles.choice, privacy === item && styles.choiceActive]} onPress={() => setPrivacy(item)}>
              <Text style={styles.choiceText}>{item.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submit, loading && styles.submitDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitText}>Create Chatroom</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
  label: { ...typography.smallBold, color: colors.textSecondary },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
  },
  choiceActive: { borderColor: colors.primary, backgroundColor: colors.primaryDark },
  choiceText: { ...typography.smallBold, color: colors.text },
  submit: { backgroundColor: colors.primary, borderRadius: borderRadius.md, alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  submitText: { ...typography.bodyBold, color: colors.white },
  submitDisabled: { opacity: 0.7 },
});
