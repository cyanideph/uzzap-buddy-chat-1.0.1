import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Container } from '@/components/ui';
import { borderRadius, colors, spacing, typography, withOpacity } from '@/constants/design';
import { INTEREST_OPTIONS } from './_onboardingData';

export default function InterestsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const canContinue = useMemo(() => selected.length >= 3, [selected.length]);

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest].slice(-8),
    );
  };

  return (
    <Container style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose your interests</Text>
          <Text style={styles.subtitle}>Pick at least 3 topics so we can recommend better buddies and chatrooms.</Text>
        </View>

        <View style={styles.tagsWrap}>
          {INTEREST_OPTIONS.map((interest) => {
            const active = selected.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.tag, active && styles.tagActive]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[styles.tagText, active && styles.tagTextActive]}>{interest}</Text>
                {active ? <Ionicons name="checkmark-circle" size={16} color={colors.background} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.helper}>{selected.length} selected (max 8)</Text>

        <View style={styles.footer}>
          <Button variant="outline" onPress={() => router.back()}>
            Back
          </Button>
          <Button variant="primary" onPress={() => router.push('/(auth)/location' as any)} disabled={!canContinue}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.sm },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  tagActive: {
    backgroundColor: colors.primary,
    borderColor: withOpacity(colors.primary, 0.8),
  },
  tagText: { ...typography.captionBold, color: colors.textSecondary },
  tagTextActive: { color: colors.backgroundSecondary },
  helper: { ...typography.small, color: colors.textTertiary },
  footer: { marginTop: 'auto', flexDirection: 'row', gap: spacing.sm },
});
