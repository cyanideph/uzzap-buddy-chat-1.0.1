import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { DownloadRule, useAppSettingsStore } from '@/store/useAppSettingsStore';

const downloadRules: { label: string; value: DownloadRule }[] = [
  { label: 'Always download', value: 'always' },
  { label: 'Wi-Fi only', value: 'wifi-only' },
  { label: 'Never auto-download', value: 'never' },
];

export default function DataSaverSettingsScreen() {
  const { imageAutoplay, setImageAutoplay, mediaDownloadRule, setMediaDownloadRule } = useAppSettingsStore();

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Data Saver' }} />
      <View style={styles.content}>
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.label}>Image autoplay</Text>
              <Switch value={imageAutoplay} onValueChange={setImageAutoplay} />
            </View>
            <Text style={styles.subHeader}>Media download rule</Text>
            {downloadRules.map((rule) => (
              <TouchableOpacity
                key={rule.value}
                style={[styles.option, mediaDownloadRule === rule.value && styles.optionActive]}
                onPress={() => setMediaDownloadRule(rule.value)}
              >
                <Text style={styles.optionText}>{rule.label}</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: { ...typography.body, color: colors.text },
  subHeader: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  optionText: { ...typography.body, color: colors.text },
});
