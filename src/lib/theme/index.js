import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const STORAGE_KEY = 'app.theme';

export const themes = {
  light: {
    id: 'light',
    colors: {
      background: '#f6f7fb',
      surface: '#ffffff',
      text: '#1e1e1e',
      muted: '#666666',
      border: '#e1e1e1',
      primary: '#1f5eff',
      danger: '#c0392b',
      chipText: '#1f5eff',
      chipBg: '#ffffff',
    },
  },
  dark: {
    id: 'dark',
    colors: {
      background: '#0f1218',
      surface: '#171b22',
      text: '#f3f4f6',
      muted: '#9aa3b2',
      border: '#2a2f3a',
      primary: '#6f8cff',
      danger: '#ff6b5a',
      chipText: '#e7edff',
      chipBg: '#242a36',
    },
  },
};

const getSystemTheme = () => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');

export const initTheme = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored || getSystemTheme();
};

export const persistTheme = async (themeId) => {
  await AsyncStorage.setItem(STORAGE_KEY, themeId);
};
