import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

const frequencies: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];

export default function BackupExportScreen() {
  const { autoBackup, setAutoBackup, backupFrequency, setBackupFrequency } = useAppSettingsStore();

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Backup & Export' }} />
      <View style={styles.content}>
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.label}>Auto-backup</Text>
              <Switch value={autoBackup} onValueChange={setAutoBackup} />
            </View>

            <Text style={styles.subHeader}>Backup frequency</Text>
            {frequencies.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.option, backupFrequency === item && styles.optionActive]}
                onPress={() => setBackupFrequency(item)}
              >
                <Text style={styles.optionText}>{item[0].toUpperCase() + item.slice(1)}</Text>
              </TouchableOpacity>
            ))}

            <Button variant="outline" onPress={() => Alert.alert('Export queued', 'Your data export will be delivered to your account email.') }>
              Export account data
            </Button>
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
