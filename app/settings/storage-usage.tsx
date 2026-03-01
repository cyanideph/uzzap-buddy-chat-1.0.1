import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

export default function StorageUsageScreen() {
  const { mediaCacheMB, clearMediaCache } = useAppSettingsStore();

  const handleClear = () => {
    clearMediaCache();
    Alert.alert('Cache cleared', 'Media cache was removed from this device.');
  };

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Storage Usage' }} />
      <View style={styles.content}>
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Media cache</Text>
            <Text style={styles.value}>{mediaCacheMB} MB</Text>
            <Text style={styles.helper}>Cached media helps open images faster. You can clear it anytime.</Text>
            <Button variant="outline" onPress={handleClear}>
              Clear media cache
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
  label: { ...typography.captionBold, color: colors.textSecondary },
  value: { ...typography.h2, color: colors.text, marginVertical: spacing.xs },
  helper: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
});
