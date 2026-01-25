import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loginWithEmail, resetPassword } from '../../lib/auth';
import { getAuthErrorKey } from '../../lib/authErrors';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useLocale } from '../../lib/i18n/LocaleProvider';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTarget, setErrorTarget] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [infoTarget, setInfoTarget] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const passwordRef = useRef(null);
  const { theme } = useTheme();
  const { locale } = useLocale();

  useFocusEffect(
    useCallback(() => {
      setErrorMessage('');
      setErrorTarget('');
      setInfoMessage('');
      setInfoTarget('');
    }, [])
  );

  const handleLogin = async () => {
    if (isLoggingIn) {
      return;
    }

    setErrorMessage('');
    setErrorTarget('');
    setInfoMessage('');
    setInfoTarget('');
    setIsLoggingIn(true);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (loginError) {
      const code = loginError?.code;
      const target =
        code === 'auth/invalid-email' || code === 'auth/user-not-found' ? 'email' : 'password';
      setErrorMessage(t(getAuthErrorKey(code)));
      setErrorTarget(target);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResetPassword = async () => {
    if (isResetting) {
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage(t('auth.reset.emptyEmail'));
      setErrorTarget('email');
      setInfoMessage('');
      setInfoTarget('');
      return;
    }

    setErrorMessage('');
    setErrorTarget('');
    setIsResetting(true);
    try {
      await resetPassword(trimmedEmail);
      setInfoMessage(t('auth.reset.sent'));
      setInfoTarget('email');
    } catch (resetError) {
      setErrorMessage(t(getAuthErrorKey(resetError?.code)));
      setErrorTarget('email');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('auth.login.title')}
      </Text>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {t('auth.email.label')}
      </Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t('auth.email.placeholder')}
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={() => passwordRef.current?.focus()}
        returnKeyType="next"
        textContentType="emailAddress"
        placeholderTextColor={theme.colors.muted}
      />
      {errorTarget === 'email' ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>
          {errorMessage}
        </Text>
      ) : null}
      {infoTarget === 'email' ? (
        <Text style={[styles.infoText, { color: theme.colors.primary }]}>
          {infoMessage}
        </Text>
      ) : null}
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {t('auth.password.label')}
      </Text>
      <View style={[styles.passwordRow, { borderColor: theme.colors.border }]}>
        <TextInput
          placeholder={t('auth.password.placeholder')}
          secureTextEntry={!isPasswordVisible}
          style={[styles.passwordInput, { color: theme.colors.text }]}
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
          returnKeyType="done"
          textContentType="password"
          ref={passwordRef}
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
      {errorTarget === 'password' ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>
          {errorMessage}
        </Text>
      ) : null}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.primary },
          isLoggingIn && styles.disabledButton,
        ]}
        onPress={handleLogin}
        disabled={isLoggingIn}
      >
        <Text style={styles.primaryButtonText}>{t('auth.login.submit')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleResetPassword}
        disabled={isResetting}
        style={isResetting ? styles.disabledButton : null}
      >
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>
          {t('auth.reset.action')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>
          {t('auth.login.noAccount')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
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
  errorText: {
    color: '#c0392b',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkText: {
    marginTop: 16,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
