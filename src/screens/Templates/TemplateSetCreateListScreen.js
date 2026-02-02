import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import { createListWithItems, subscribeToTemplateSets } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function TemplateSetCreateListScreen({ route, navigation }) {
  const { templateId, setId } = route.params || {};
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [setItem, setSetItem] = useState(null);
  const [listName, setListName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!templateId || !setId) {
      return undefined;
    }
    return subscribeToTemplateSets(templateId, (items) => {
      const next = items.find((item) => item.id === setId) || null;
      setSetItem(next);
    });
  }, [templateId, setId]);

  const handleCreate = async () => {
    if (!setItem || isCreating) {
      return;
    }
    const trimmed = listName.trim();
    if (!trimmed) {
      setError(t('templates.createListNameRequired'));
      return;
    }
    setError('');
    setIsCreating(true);
    try {
      await createListWithItems({
        name: trimmed,
        items: setItem.items || [],
        ownerUid: auth.currentUser?.uid || 'unknown',
        ownerEmail: auth.currentUser?.email || '',
      });
      showToast(t('templates.toastAdded', { name: trimmed }));
      navigation.goBack();
    } catch (errorCreate) {
      setError(t('templates.toastError'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('templates.createListTitle')}</Text>
      <TextInput
        placeholder={t('templates.createListPlaceholder')}
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        value={listName}
        onChangeText={setListName}
        placeholderTextColor={theme.colors.muted}
        onSubmitEditing={handleCreate}
        returnKeyType="done"
      />
      {error ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text> : null}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.primary },
          isCreating && styles.disabledButton,
        ]}
        onPress={handleCreate}
        disabled={isCreating}
      >
        <Text style={styles.primaryButtonText}>{t('templates.createListAction')}</Text>
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
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 40,
  },
  errorText: {
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
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
