import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import Constants from 'expo-constants';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

export default function DiagnosticsScreen() {
  const { diagnosticsMode, setDiagnosticsMode, crashReports, setCrashReports } = useAppSettingsStore();

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Diagnostics' }} />
      <View style={styles.content}>
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Support diagnostics</Text>
            <Text style={styles.meta}>App version: {Constants.expoConfig?.version ?? 'unknown'}</Text>
            <Text style={styles.meta}>Runtime: {Constants.executionEnvironment}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Enable debug mode</Text>
              <Switch value={diagnosticsMode} onValueChange={setDiagnosticsMode} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Share crash reports</Text>
              <Switch value={crashReports} onValueChange={setCrashReports} />
            </View>

            <Button variant="outline" onPress={() => Alert.alert('Copied', 'Diagnostic payload copied for support (simulated).')}>
              Copy diagnostic payload
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
  title: { ...typography.h4, color: colors.text, marginBottom: spacing.xs },
  meta: { ...typography.caption, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  label: { ...typography.body, color: colors.text },
});
