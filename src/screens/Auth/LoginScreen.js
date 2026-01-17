import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginWithEmail, resetPassword } from '../../lib/auth';
import { getAuthErrorKey } from '../../lib/authErrors';
import { t } from '../../lib/i18n';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleLogin = async () => {
    setError('');
    setInfo('');
    try {
      await loginWithEmail(email.trim(), password);
    } catch (loginError) {
      setError(t(getAuthErrorKey(loginError?.code)));
    }
  };

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t('auth.reset.emptyEmail'));
      setInfo('');
      return;
    }

    setError('');
    try {
      await resetPassword(trimmedEmail);
      setInfo(t('auth.reset.sent'));
    } catch (resetError) {
      setError(t(getAuthErrorKey(resetError?.code)));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login.title')}</Text>
      <Text style={styles.label}>{t('auth.email.label')}</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t('auth.email.placeholder')}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        textContentType="emailAddress"
      />
      <Text style={styles.label}>{t('auth.password.label')}</Text>
      <TextInput
        placeholder={t('auth.password.placeholder')}
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        textContentType="password"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {info ? <Text style={styles.infoText}>{info}</Text> : null}
      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>{t('auth.login.submit')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleResetPassword}>
        <Text style={styles.linkText}>{t('auth.reset.action')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>{t('auth.login.noAccount')}</Text>
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
    borderColor: '#d0d0d0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: '#c0392b',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    color: '#1f5eff',
    marginBottom: 8,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#1f5eff',
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
    color: '#1f5eff',
    marginTop: 16,
    textAlign: 'center',
  },
});
