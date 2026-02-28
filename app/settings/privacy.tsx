import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';

const ITEMS = [
  { key: 'blocked-users', label: 'Blocked Users' },
  { key: 'visibility', label: 'Profile Visibility' },
  { key: 'data', label: 'Data & Permissions' },
];

export default function PrivacySecurityScreen() {
  const handlePress = (label: string) => {
    Alert.alert(label, `${label} controls can be expanded here.`);
  };

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Privacy & Security' }} />
      <View style={styles.card}>
        {ITEMS.map((item) => (
          <TouchableOpacity key={item.key} style={styles.item} onPress={() => handlePress(item.label)}>
            <Text style={styles.itemText}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  item: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: {
    ...typography.body,
    color: colors.text,
  },
  chevron: {
    ...typography.h3,
    color: colors.textTertiary,
  },
});
