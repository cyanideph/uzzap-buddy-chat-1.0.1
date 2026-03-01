import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

export default function ConnectedAccountsScreen() {
  const { connectedAccounts, disconnectAccount } = useAppSettingsStore();

  const onDisconnect = (id: string, provider: string) => {
    Alert.alert('Disconnect account', `Disconnect ${provider}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Disconnect', style: 'destructive', onPress: () => disconnectAccount(id) },
    ]);
  };

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Connected Accounts' }} />
      <View style={styles.content}>
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            {connectedAccounts.length === 0 ? (
              <Text style={styles.empty}>No connected accounts.</Text>
            ) : (
              connectedAccounts.map((account) => (
                <View key={account.id} style={styles.accountRow}>
                  <View style={styles.accountInfo}>
                    <Text style={styles.provider}>{account.provider}</Text>
                    <Text style={styles.meta}>{account.handle}</Text>
                    <Text style={styles.meta}>Connected {account.connectedAt}</Text>
                    <Text style={styles.status}>{account.status === 'connected' ? 'Healthy' : 'Token expiring soon'}</Text>
                  </View>
                  <Button variant="ghost" size="sm" onPress={() => onDisconnect(account.id, account.provider)}>
                    Disconnect
                  </Button>
                </View>
              ))
            )}
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
  accountRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountInfo: { flexShrink: 1 },
  provider: { ...typography.bodyBold, color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary },
  status: { ...typography.small, color: colors.warning, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textSecondary },
});
