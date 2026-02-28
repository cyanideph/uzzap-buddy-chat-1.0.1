import React from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';

export default function NotificationsSettingsScreen() {
  const [enabled, setEnabled] = React.useState(true);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    Alert.alert('Notifications', next ? 'Push notifications enabled.' : 'Push notifications disabled.');
  };

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Notifications' }} />
      <View style={styles.row}>
        <View style={styles.labelWrap}>
          <Text style={styles.label}>Push Notifications</Text>
          <Text style={styles.caption}>Control app alerts for chats and buddy activity.</Text>
        </View>
        <Switch value={enabled} onValueChange={toggle} trackColor={{ true: colors.primary, false: colors.border }} />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  row: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
