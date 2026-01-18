import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';

const LANGUAGES = [
  { code: 'ru', native: 'Русский' },
  { code: 'de', native: 'Deutsch' },
  { code: 'en', native: 'English' },
];

export default function LanguageScreen() {
  const { locale, setLocale } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.language.title')}</Text>
      <View style={styles.list}>
        {LANGUAGES.map((lang) => {
          const isActive = locale === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.row, isActive && styles.rowActive]}
              onPress={() => setLocale(lang.code)}
            >
              <View style={styles.textBlock}>
                <Text style={[styles.nativeName, isActive && styles.nativeNameActive]}>
                  {lang.native}
                </Text>
                <Text style={styles.localizedName}>{t(`settings.language.${lang.code}`)}</Text>
              </View>
              {isActive ? <Text style={styles.check}>✓</Text> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  list: {
    gap: 10,
  },
  row: {
    borderColor: '#e1e1e1',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowActive: {
    borderColor: '#1f5eff',
    backgroundColor: '#f2f6ff',
  },
  textBlock: {
    flex: 1,
  },
  nativeName: {
    fontSize: 15,
    fontWeight: '600',
  },
  nativeNameActive: {
    color: '#1f5eff',
  },
  localizedName: {
    color: '#666',
    marginTop: 4,
  },
  check: {
    color: '#1f5eff',
    fontSize: 16,
    fontWeight: '700',
  },
});
