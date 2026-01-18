import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from './translations/en';
import ru from './translations/ru';
import de from './translations/de';

const STORAGE_KEY = 'app.locale';
const SUPPORTED_LOCALES = ['en', 'ru', 'de'];

const normalizeLocale = (locale) => {
  if (!locale) return 'en';
  const lower = locale.toLowerCase();
  if (SUPPORTED_LOCALES.includes(lower)) {
    return lower;
  }
  const base = lower.split('-')[0];
  return SUPPORTED_LOCALES.includes(base) ? base : 'en';
};

const i18n = new I18n({ en, ru, de });
i18n.enableFallback = true;
i18n.locale = normalizeLocale(i18n.locale || getDeviceLocale());

export const getDeviceLocale = () => {
  const locales = Localization.getLocales();
  const languageCode = locales?.[0]?.languageCode;
  return normalizeLocale(languageCode);
};

export const initI18n = async () => {
  const storedLocale = await AsyncStorage.getItem(STORAGE_KEY);
  i18n.locale = normalizeLocale(storedLocale || getDeviceLocale());
};

export const setLocale = async (locale) => {
  const normalized = normalizeLocale(locale);
  i18n.locale = normalized;
  await AsyncStorage.setItem(STORAGE_KEY, normalized);
};

export const getLocale = () => normalizeLocale(i18n.locale || getDeviceLocale());

export const t = (key, params = {}) => i18n.t(key, params);
