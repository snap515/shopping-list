import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import { createListWithItems, subscribeToUserRecipes } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function RecipeCreateListScreen({ route, navigation }) {
  const { recipeId } = route.params || {};
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [recipe, setRecipe] = useState(null);
  const [listName, setListName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid || !recipeId) {
      return undefined;
    }
    return subscribeToUserRecipes(uid, (items) => {
      const next = items.find((item) => item.id === recipeId) || null;
      setRecipe(next);
      if (next && !listName) {
        setListName(next.name || '');
      }
    });
  }, [recipeId]);

  const handleCreate = async () => {
    if (isCreating) {
      return;
    }
    const trimmedName = listName.trim();
    if (!trimmedName) {
      setError(t('recipes.createListNameRequired'));
      return;
    }
    if (!recipe) {
      setError(t('recipes.notFound'));
      return;
    }

    setError('');
    setIsCreating(true);
    try {
      await createListWithItems({
        name: trimmedName,
        items: recipe.items || [],
        ownerUid: auth.currentUser?.uid || 'unknown',
        ownerEmail: auth.currentUser?.email || '',
      });
      showToast(t('recipes.toastAdded', { name: trimmedName }));
      navigation.goBack();
    } catch (err) {
      setError(t('recipes.toastError'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('recipes.createListTitle')}
      </Text>
      <TextInput
        placeholder={t('recipes.createListPlaceholder')}
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        value={listName}
        onChangeText={setListName}
        placeholderTextColor={theme.colors.muted}
      />
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.primary },
          isCreating && styles.disabledButton,
        ]}
        onPress={handleCreate}
        disabled={isCreating}
      >
        <Text style={styles.primaryButtonText}>{t('recipes.createListAction')}</Text>
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
  },
  errorText: {
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 12,
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
