import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { t } from '../lib/i18n';
import { useLocale } from '../lib/i18n/LocaleProvider';

const LANGUAGES = ['ru', 'de', 'en'];
const LANGUAGE_LABELS = {
  ru: 'Русский',
  de: 'Deutsch',
  en: 'English',
};

export default function LanguageSelector({ align = 'left' }) {
  const { locale, setLocale } = useLocale();

  return (
    <View style={[styles.container, align === 'right' && styles.alignRight]}>
      <Text style={styles.label}>{t('settings.language.title')}</Text>
      <View style={styles.row}>
        {LANGUAGES.map((lang) => {
          const isActive = locale === lang;
          return (
            <TouchableOpacity
              key={lang}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setLocale(lang)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {LANGUAGE_LABELS[lang]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  label: {
    color: '#666',
    fontSize: 12,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderColor: '#1f5eff',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipActive: {
    backgroundColor: '#1f5eff',
  },
  chipText: {
    color: '#1f5eff',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
});
