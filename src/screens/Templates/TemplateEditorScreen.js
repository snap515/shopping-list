import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../lib/firebase';
import { createTemplate } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function TemplateEditorScreen({ navigation }) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setError('');
    }, [])
  );

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t('templates.nameRequired'));
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await createTemplate({
        name: trimmedName,
        ownerUid: auth.currentUser?.uid || 'unknown',
      });
      showToast(t('templates.savedToast', { name: trimmedName }));
      navigation.goBack();
    } catch (saveError) {
      setError(t('templates.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('templates.createTitle')}</Text>
      <TextInput
        placeholder={t('templates.namePlaceholder')}
        style={[
          styles.inputBase,
          styles.nameInput,
          { borderColor: theme.colors.border, color: theme.colors.text },
        ]}
        value={name}
        onChangeText={setName}
        placeholderTextColor={theme.colors.muted}
      />
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.primary },
          isSaving && styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.primaryButtonText}>{t('templates.saveTemplate')}</Text>
      </TouchableOpacity>
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
  inputBase: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 0,
    height: 40,
  },
  nameInput: {
    width: '100%',
    marginBottom: 8,
  },
  errorText: {
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
