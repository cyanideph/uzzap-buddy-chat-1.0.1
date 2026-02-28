import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';

export default function NotificationsSettingsScreen() {
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [buddyRequests, setBuddyRequests] = useState(true);

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Notifications' }} />
      <View style={styles.content}>
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.label}>Message alerts</Text>
              <Switch value={messageAlerts} onValueChange={setMessageAlerts} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Buddy requests</Text>
              <Switch value={buddyRequests} onValueChange={setBuddyRequests} />
            </View>
            <Text style={styles.helper}>Settings are currently local-only in this version.</Text>
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
    paddingVertical: spacing.sm,
  },
  label: { ...typography.body, color: colors.text },
  helper: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md },
});
