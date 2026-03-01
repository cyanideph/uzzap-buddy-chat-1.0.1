import { useColorScheme } from 'react-native';
import { colors } from '@/constants/design';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

const lightColors = {
  background: '#F8FAFC',
  backgroundSecondary: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#CBD5E1',
  optionActiveBackground: '#D1FAE5',
  optionActiveText: '#065F46',
};

const darkColors = {
  background: colors.background,
  backgroundSecondary: colors.backgroundSecondary,
  text: colors.text,
  textSecondary: colors.textSecondary,
  border: colors.border,
  optionActiveBackground: '#0F3D2D',
  optionActiveText: colors.text,
};

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const themePreference = useAppSettingsStore((state) => state.theme);

  const resolvedTheme =
    themePreference === 'system' ? (systemColorScheme ?? 'dark') : themePreference;
  const isDark = resolvedTheme === 'dark';

  return {
    themePreference,
    resolvedTheme,
    isDark,
    statusBarStyle: isDark ? 'light' : 'dark',
    colors: isDark ? darkColors : lightColors,
  } as const;
}
