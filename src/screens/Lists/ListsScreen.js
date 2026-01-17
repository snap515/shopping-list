import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logout } from '../../lib/auth';
import { t } from '../../lib/i18n';

export default function ListsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('lists.title')}</Text>
      <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
        <Text style={styles.secondaryButtonText}>{t('auth.logout')}</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  secondaryButton: {
    borderColor: '#1f5eff',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#1f5eff',
    fontSize: 16,
    fontWeight: '600',
  },
});
