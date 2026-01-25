import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { changePassword, logout } from '../../lib/auth';
import { auth } from '../../lib/firebase';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';

const LANGUAGE_NATIVE_NAMES = {
  ru: 'Русский',
  de: 'Deutsch',
  en: 'English',
};

export default function SettingsScreen({ navigation }) {
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const userEmail = auth.currentUser?.email || t('auth.anonymous');
  const { locale } = useLocale();
  const { theme, themeId, setThemeId } = useTheme();

  useFocusEffect(
    useCallback(() => {
      setError('');
      setInfo('');
    }, [])
  );

  const handleChangePassword = async () => {
    if (isChangingPassword) {
      return;
    }

    const trimmedPassword = newPassword.trim();
    if (!trimmedPassword) {
      setError(t('auth.change.emptyPassword'));
      setInfo('');
      return;
    }

    setError('');
    setIsChangingPassword(true);
    try {
      await changePassword(trimmedPassword);
      setNewPassword('');
      setInfo(t('auth.change.success'));
    } catch (changeError) {
      setError(t('auth.change.error'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.subtitleTop, { color: theme.colors.muted }]}>
        {t('auth.signedInAs')} {userEmail}
      </Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('settings.title')}</Text>
      <TouchableOpacity
        style={[
          styles.languageButton,
          { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
        ]}
        onPress={() => setThemeId(themeId === 'light' ? 'dark' : 'light')}
      >
        <View>
          <Text style={[styles.languageTitle, { color: theme.colors.text }]}>
            {t('settings.theme.title')}
          </Text>
          <Text style={[styles.languageValue, { color: theme.colors.muted }]}>
            {t(`settings.theme.${themeId}`)}
          </Text>
        </View>
        <Text style={[styles.languageChevron, { color: theme.colors.muted }]}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.languageButton,
          { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
        ]}
        onPress={() => navigation.navigate('Language')}
      >
        <View>
          <Text style={[styles.languageTitle, { color: theme.colors.text }]}>
            {t('settings.language.title')}
          </Text>
          <Text style={[styles.languageValue, { color: theme.colors.muted }]}>
            {LANGUAGE_NATIVE_NAMES[locale] || locale}
          </Text>
        </View>
        <Text style={[styles.languageChevron, { color: theme.colors.muted }]}>›</Text>
      </TouchableOpacity>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('auth.change.title')}
        </Text>
        <View style={[styles.passwordRow, { borderColor: theme.colors.border }]}>
          <TextInput
            placeholder={t('auth.change.placeholder')}
            secureTextEntry={!isPasswordVisible}
            style={[
              styles.passwordInput,
              { color: theme.colors.text },
            ]}
            value={newPassword}
            onChangeText={setNewPassword}
            textContentType="newPassword"
            placeholderTextColor={theme.colors.muted}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
          >
            <Text style={[styles.toggleButtonText, { color: theme.colors.primary }]}>
              {isPasswordVisible ? t('auth.password.hide') : t('auth.password.show')}
            </Text>
          </TouchableOpacity>
        </View>
        {error ? (
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
        ) : null}
        {info ? (
          <Text style={[styles.infoText, { color: theme.colors.primary }]}>{info}</Text>
        ) : null}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
            isChangingPassword && styles.disabledButton,
          ]}
          onPress={handleChangePassword}
          disabled={isChangingPassword}
        >
          <Text style={styles.primaryButtonText}>{t('auth.change.submit')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
        onPress={logout}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
          {t('auth.logout')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  subtitleTop: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  languageButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  languageValue: {
    marginTop: 4,
  },
  languageChevron: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleButtonText: {
    color: '#1f5eff',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
