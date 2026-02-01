import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../lib/firebase';
import { createRecipe } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function RecipeEditorScreen({ navigation }) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setError('');
    }, [])
  );

  const handleAddIngredient = () => {
    const trimmed = ingredient.trim();
    if (!trimmed) {
      return;
    }
    setItems((prev) => [...prev, trimmed]);
    setIngredient('');
    inputRef.current?.focus();
  };

  const handleRemoveIngredient = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t('recipes.nameRequired'));
      return;
    }
    if (items.length === 0) {
      setError(t('recipes.itemsRequired'));
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await createRecipe({
        name: trimmedName,
        items,
        ownerUid: auth.currentUser?.uid || 'unknown',
      });
      showToast(t('recipes.savedToast', { name: trimmedName }));
      navigation.goBack();
    } catch (saveError) {
      setError(t('recipes.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('recipes.createTitle')}</Text>
      <TextInput
        placeholder={t('recipes.namePlaceholder')}
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
          placeholder={t('recipes.ingredientPlaceholder')}
          style={[
            styles.inputBase,
            styles.ingredientInput,
            { borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={ingredient}
          onChangeText={setIngredient}
          onSubmitEditing={handleAddIngredient}
          returnKeyType="done"
          ref={inputRef}
          placeholderTextColor={theme.colors.muted}
        />
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { borderColor: theme.colors.primary },
            ingredient.trim() === '' && styles.disabledButton,
          ]}
          onPress={handleAddIngredient}
          disabled={ingredient.trim() === ''}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
            {t('recipes.addIngredient')}
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
            <TouchableOpacity onPress={() => handleRemoveIngredient(index)}>
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
        <Text style={styles.primaryButtonText}>{t('recipes.saveRecipe')}</Text>
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
  ingredientInput: {
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
    paddingVertical: 12,
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
