import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';

const LANGUAGES = [
  { code: 'ru', native: 'Русский' },
  { code: 'de', native: 'Deutsch' },
  { code: 'en', native: 'English' },
];

export default function LanguageScreen() {
  const { locale, setLocale } = useLocale();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('settings.language.title')}
      </Text>
      <View style={styles.list}>
        {LANGUAGES.map((lang) => {
          const isActive = locale === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.row,
                {
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  backgroundColor: isActive ? theme.colors.chipBg : theme.colors.surface,
                },
              ]}
              onPress={() => setLocale(lang.code)}
            >
              <View style={styles.textBlock}>
                <Text
                  style={[
                    styles.nativeName,
                    { color: isActive ? theme.colors.primary : theme.colors.text },
                  ]}
                >
                  {lang.native}
                </Text>
                <Text style={[styles.localizedName, { color: theme.colors.muted }]}>
                  {t(`settings.language.${lang.code}`)}
                </Text>
              </View>
              {isActive ? (
                <Text style={[styles.check, { color: theme.colors.primary }]}>✓</Text>
              ) : null}
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
  textBlock: {
    flex: 1,
  },
  nativeName: {
    fontSize: 15,
    fontWeight: '600',
  },
  localizedName: {
    marginTop: 4,
  },
  check: {
    fontSize: 16,
    fontWeight: '700',
  },
});
