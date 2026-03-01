import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Container, Button } from '@/components/ui';
import { borderRadius, colors, spacing, typography, withOpacity } from '@/constants/design';
import { ONBOARDING_SLIDES } from '@/constants/onboardingData';

export default function WelcomeScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[index];

  const next = () => {
    if (index < ONBOARDING_SLIDES.length - 1) {
      setIndex((prev) => prev + 1);
      return;
    }
    router.push('/(auth)/interests' as any);
  };

  return (
    <Container style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.heroIconWrap}>
          <Ionicons name={slide.icon as any} size={48} color={colors.primary} />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.description}</Text>

        <View style={styles.dotsRow}>
          {ONBOARDING_SLIDES.map((_, dotIndex) => (
            <View key={dotIndex} style={[styles.dot, index === dotIndex && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.ctaWrap}>
          <Button variant="primary" size="lg" onPress={next}>
            {index === ONBOARDING_SLIDES.length - 1 ? 'Start setup' : 'Next'}
          </Button>
          <Button variant="ghost" size="lg" onPress={() => router.push('/(auth)/register' as any)}>
            I already have my details
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  skipBtn: { alignSelf: 'flex-end' },
  skipText: { ...typography.captionBold, color: colors.textTertiary },
  heroIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: withOpacity(colors.primary, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.3),
  },
  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  dotActive: { width: 24, backgroundColor: colors.primary },
  ctaWrap: { gap: spacing.sm },
});
