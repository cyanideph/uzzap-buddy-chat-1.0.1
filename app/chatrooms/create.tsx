import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { Container, Input } from '@/components/ui';
import { categories } from '@/lib/chatroomDiscovery';
import { colors, borderRadius, spacing, typography } from '@/constants/design';

const languages = ['English', 'Filipino', 'Bisaya'];

export default function AdvancedCreateChatroomScreen() {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [language, setLanguage] = useState(languages[0]);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');

  return (
    <Container>
      <Stack.Screen options={{ title: 'Create Chatroom (Advanced)' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Room Name" value={name} onChangeText={setName} placeholder="e.g. Friday Night Gamers" />
        <Input label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />
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
          style={styles.submit}
          onPress={() => Alert.alert('Chatroom created', `Name: ${name}\nCategory: ${selectedCategory}\nLanguage: ${language}\nPrivacy: ${privacy}`)}
        >
          <Text style={styles.submitText}>Create Chatroom</Text>
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
});
