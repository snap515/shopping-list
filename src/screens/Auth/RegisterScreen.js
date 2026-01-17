import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerWithEmail } from '../../lib/auth';
import { createUserProfile } from '../../lib/firestore';
import { t } from '../../lib/i18n';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    try {
      const userCredential = await registerWithEmail(email.trim(), password);
      await createUserProfile({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      });
    } catch (registerError) {
      setError(t('auth.register.error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.register.title')}</Text>
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
        textContentType="newPassword"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
        <Text style={styles.primaryButtonText}>{t('auth.register.submit')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>{t('auth.register.haveAccount')}</Text>
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
