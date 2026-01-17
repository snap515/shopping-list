import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login.title')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
