import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, withOpacity } from '@/constants/design';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compactLayout = width < 380;
  const { colors: themeColors, isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? colors.accent : colors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.backgroundSecondary,
          borderTopColor: withOpacity(colors.primary, isDark ? 0.2 : 0.12),
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 64 + insets.bottom : 64,
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 12,
          paddingTop: compactLayout ? 8 : 10,
          paddingHorizontal: compactLayout ? 6 : 10,
        },
        tabBarItemStyle: {
          borderRadius: borderRadius.lg,
        },
        tabBarLabelStyle: {
          ...typography.smallBold,
          marginTop: compactLayout ? -1 : -2,
        },
        tabBarActiveBackgroundColor: withOpacity(colors.primary, isDark ? 0.16 : 0.1),
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: themeColors.background,
        },
        headerStyle: {
          backgroundColor: themeColors.background,
          borderBottomColor: themeColors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          ...typography.h3,
          color: themeColors.text,
        },
        headerTintColor: themeColors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chatrooms',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="buddies"
        options={{
          title: 'Buddies',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
