import React from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';

const REFERRAL_CODE = 'UZZAP-BUDDY-2026';

export default function InviteFriendsScreen() {
  const router = useRouter();

  const handleShare = async () => {
    await Share.share({
      message: `Join me on Uzzap Buddy Chat! Use my referral code: ${REFERRAL_CODE}`,
    });
  };

  return (
    <Container style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Invite friends</Text>
        <Text style={styles.subtitle}>Grow your network faster by inviting friends with your referral code.</Text>

        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            <Text style={styles.codeLabel}>Referral code</Text>
            <Text style={styles.codeValue}>{REFERRAL_CODE}</Text>
          </Card.Content>
        </Card>

        <Button variant="primary" onPress={handleShare}>
          Share invite link
        </Button>
        <Button variant="outline" onPress={() => router.replace('/(tabs)')}>
          Finish setup
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  card: { backgroundColor: colors.backgroundSecondary },
  codeLabel: { ...typography.caption, color: colors.textTertiary },
  codeValue: { ...typography.h3, color: colors.primary, marginTop: spacing.xs },
});
