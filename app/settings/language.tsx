import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { AppLanguage, useAppSettingsStore } from '@/store/useAppSettingsStore';

const languages: AppLanguage[] = ['English', 'Filipino', 'Bisaya', 'Spanish'];

export default function LanguageSettingsScreen() {
  const { language, setLanguage } = useAppSettingsStore();

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Language' }} />
      <View style={styles.content}>
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            <Text style={styles.header}>App language</Text>
            {languages.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.option, language === item && styles.optionActive]}
                onPress={() => setLanguage(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { padding: spacing.md },
  card: { backgroundColor: colors.backgroundSecondary },
  header: { ...typography.h4, color: colors.text, marginBottom: spacing.sm },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  optionText: { ...typography.body, color: colors.text },
});
