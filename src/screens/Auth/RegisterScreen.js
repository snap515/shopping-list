import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerWithEmail } from '../../lib/auth';
import { getAuthErrorKey } from '../../lib/authErrors';
import { createUserProfile } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const passwordRef = useRef(null);
  const { theme } = useTheme();

  const handleRegister = async () => {
    setError('');
    try {
      const userCredential = await registerWithEmail(email.trim(), password);
      await createUserProfile({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      });
    } catch (registerError) {
      setError(t(getAuthErrorKey(registerError?.code)));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('auth.register.title')}
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
          onSubmitEditing={handleRegister}
          returnKeyType="done"
          textContentType="newPassword"
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
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleRegister}
      >
        <Text style={styles.primaryButtonText}>{t('auth.register.submit')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>
          {t('auth.register.haveAccount')}
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
