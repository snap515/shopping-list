import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from './translations/en';
import ru from './translations/ru';
import de from './translations/de';

const STORAGE_KEY = 'app.locale';

const i18n = new I18n({ en, ru, de });
i18n.enableFallback = true;
i18n.locale = i18n.locale || getDeviceLocale();

export const getDeviceLocale = () => {
  const locales = Localization.getLocales();
  const languageCode = locales?.[0]?.languageCode;
  return languageCode && ['en', 'ru', 'de'].includes(languageCode) ? languageCode : 'en';
};

export const initI18n = async () => {
  const storedLocale = await AsyncStorage.getItem(STORAGE_KEY);
  i18n.locale = storedLocale || getDeviceLocale();
};

export const setLocale = async (locale) => {
  i18n.locale = locale;
  await AsyncStorage.setItem(STORAGE_KEY, locale);
};

export const getLocale = () => i18n.locale || getDeviceLocale();

export const t = (key, params = {}) => i18n.t(key, params);
