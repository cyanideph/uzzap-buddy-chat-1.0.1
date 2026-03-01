import React from 'react';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';

type InfoScreenProps = {
  title: string;
  subtitle?: string;
  sections: { heading: string; body: string[] }[];
};

export function InfoScreen({ title, subtitle, sections }: InfoScreenProps) {
  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.card}>
          <Card.Content>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {sections.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={styles.heading}>{section.heading}</Text>
                {section.body.map((line) => (
                  <Text key={line} style={styles.body}>
                    • {line}
                  </Text>
                ))}
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { padding: spacing.md },
  card: { backgroundColor: colors.backgroundSecondary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  section: { marginBottom: spacing.md },
  heading: { ...typography.h4, color: colors.text, marginBottom: spacing.xs },
  body: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
});
