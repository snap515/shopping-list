import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { changePassword, logout } from '../../lib/auth';
import { auth } from '../../lib/firebase';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';

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
  const userEmail = auth.currentUser?.email || t('auth.anonymous');
  const { locale } = useLocale();

  const handleChangePassword = async () => {
    const trimmedPassword = newPassword.trim();
    if (!trimmedPassword) {
      setError(t('auth.change.emptyPassword'));
      setInfo('');
      return;
    }

    setError('');
    try {
      await changePassword(trimmedPassword);
      setNewPassword('');
      setInfo(t('auth.change.success'));
    } catch (changeError) {
      setError(t('auth.change.error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitleTop}>
        {t('auth.signedInAs')} {userEmail}
      </Text>
      <Text style={styles.title}>{t('settings.title')}</Text>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => navigation.navigate('Language')}
      >
        <View>
          <Text style={styles.languageTitle}>{t('settings.language.title')}</Text>
          <Text style={styles.languageValue}>
            {LANGUAGE_NATIVE_NAMES[locale] || locale}
          </Text>
        </View>
        <Text style={styles.languageChevron}>›</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {info ? <Text style={styles.infoText}>{info}</Text> : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('auth.change.title')}</Text>
        <View style={styles.passwordRow}>
          <TextInput
            placeholder={t('auth.change.placeholder')}
            secureTextEntry={!isPasswordVisible}
            style={styles.passwordInput}
            value={newPassword}
            onChangeText={setNewPassword}
            textContentType="newPassword"
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
          >
            <Text style={styles.toggleButtonText}>
              {isPasswordVisible ? t('auth.password.hide') : t('auth.password.show')}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword}>
          <Text style={styles.primaryButtonText}>{t('auth.change.submit')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
        <Text style={styles.secondaryButtonText}>{t('auth.logout')}</Text>
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
    color: '#666',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  languageButton: {
    borderColor: '#e1e1e1',
    borderRadius: 10,
    borderWidth: 1,
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
    color: '#666',
    marginTop: 4,
  },
  languageChevron: {
    color: '#999',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#c0392b',
    marginBottom: 8,
  },
  infoText: {
    color: '#1f5eff',
    marginBottom: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#d0d0d0',
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
    backgroundColor: '#1f5eff',
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
    borderColor: '#1f5eff',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#1f5eff',
    fontSize: 16,
    fontWeight: '600',
  },
});
