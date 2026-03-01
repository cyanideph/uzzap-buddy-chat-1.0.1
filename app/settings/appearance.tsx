import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { ThemePreference, useAppSettingsStore } from '@/store/useAppSettingsStore';

const themes: ThemePreference[] = ['system', 'light', 'dark'];

export default function AppearanceSettingsScreen() {
  const { theme, setTheme } = useAppSettingsStore();

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Appearance' }} />
      <View style={styles.content}>
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            <Text style={styles.header}>Choose theme</Text>
            {themes.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.option, theme === item && styles.optionActive]}
                onPress={() => setTheme(item)}
              >
                <Text style={styles.optionText}>{item[0].toUpperCase() + item.slice(1)}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.helper}>Theme preference is saved locally for now.</Text>
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
  helper: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md },
});
