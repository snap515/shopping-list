import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createTemplateSet } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function TemplateSetEditorScreen({ route, navigation }) {
  const { templateId } = route.params || {};
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [itemText, setItemText] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setError('');
    }, [])
  );

  const handleAddItem = () => {
    const trimmed = itemText.trim();
    if (!trimmed) {
      return;
    }
    setItems((prev) => [...prev, trimmed]);
    setItemText('');
    inputRef.current?.focus();
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t('templates.nameRequired'));
      return;
    }
    if (items.length === 0) {
      setError(t('templates.itemsRequired'));
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await createTemplateSet({
        templateId,
        name: trimmedName,
        items,
      });
      showToast(t('templates.savedSetToast', { name: trimmedName }));
      navigation.goBack();
    } catch (saveError) {
      setError(t('templates.saveSetError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('templates.createSetTitle')}</Text>
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
      <View style={styles.formRow}>
        <TextInput
          placeholder={t('templates.ingredientPlaceholder')}
          style={[
            styles.inputBase,
            styles.itemInput,
            { borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={itemText}
          onChangeText={setItemText}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
          ref={inputRef}
          placeholderTextColor={theme.colors.muted}
        />
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { borderColor: theme.colors.primary },
            itemText.trim() === '' && styles.disabledButton,
          ]}
          onPress={handleAddItem}
          disabled={itemText.trim() === ''}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
            {t('templates.addIngredient')}
          </Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.itemRow,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.itemText, { color: theme.colors.text }]}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveItem(index)}>
              <Text style={[styles.removeText, { color: theme.colors.danger }]}>
                {t('common.delete')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.primary },
          isSaving && styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.primaryButtonText}>{t('templates.saveSet')}</Text>
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
  itemInput: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 12,
  },
  itemRow: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 14,
    flex: 1,
  },
  removeText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
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
