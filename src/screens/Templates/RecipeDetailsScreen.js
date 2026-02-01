import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '../../lib/firebase';
import { subscribeToUserRecipes, updateRecipeItems, updateRecipeName } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function RecipeDetailsScreen({ route, navigation }) {
  const { recipeId } = route.params || {};
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [recipe, setRecipe] = useState(null);
  const [nameDraft, setNameDraft] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [itemsDraft, setItemsDraft] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid || !recipeId) {
      return undefined;
    }
    return subscribeToUserRecipes(uid, (items) => {
      const next = items.find((item) => item.id === recipeId) || null;
      setRecipe(next);
      if (next) {
        setNameDraft(next.name || '');
        setItemsDraft(Array.isArray(next.items) ? next.items : []);
      }
    });
  }, [recipeId]);

  const canSaveName = useMemo(() => {
    const trimmed = nameDraft.trim();
    return !!recipe && trimmed.length > 0 && trimmed !== recipe.name;
  }, [nameDraft, recipe]);

  const handleSaveName = async () => {
    if (!recipe || isSavingName) {
      return;
    }
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      showToast(t('recipes.nameRequired'));
      return;
    }
    setIsSavingName(true);
    try {
      await updateRecipeName(recipe.id, trimmed);
      showToast(t('recipes.renameSuccess', { name: trimmed }));
    } catch (error) {
      showToast(t('recipes.renameError'));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleStartEditItem = (index) => {
    setEditingIndex(index);
    setEditingValue(itemsDraft[index] || '');
  };

  const handleCancelEditItem = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const persistItems = async (nextItems, successKey) => {
    if (!recipe || isSavingItem) {
      return;
    }
    setIsSavingItem(true);
    try {
      await updateRecipeItems(recipe.id, nextItems);
      if (successKey) {
        showToast(t(successKey));
      }
    } catch (error) {
      showToast(t('recipes.itemUpdateError'));
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleSaveItem = async () => {
    if (editingIndex === null) {
      return;
    }
    const trimmed = editingValue.trim();
    if (!trimmed) {
      showToast(t('recipes.itemRequired'));
      return;
    }
    const nextItems = itemsDraft.map((item, index) =>
      index === editingIndex ? trimmed : item
    );
    setItemsDraft(nextItems);
    setEditingIndex(null);
    setEditingValue('');
    await persistItems(nextItems, 'recipes.itemUpdated');
  };

  const handleDeleteItem = (index) => {
    const runDelete = async () => {
      const nextItems = itemsDraft.filter((_, itemIndex) => itemIndex !== index);
      setItemsDraft(nextItems);
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingValue('');
      }
      await persistItems(nextItems, 'recipes.itemDeleted');
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(t('recipes.deleteItemConfirm'));
      if (confirmed) {
        runDelete();
      }
      return;
    }

    Alert.alert(
      t('recipes.deleteItemTitle'),
      t('recipes.deleteItemConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: runDelete },
      ],
      { cancelable: true }
    );
  };

  const handleAddItem = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) {
      showToast(t('recipes.itemRequired'));
      return;
    }
    const nextItems = [...itemsDraft, trimmed];
    setItemsDraft(nextItems);
    setNewItem('');
    await persistItems(nextItems, 'recipes.itemUpdated');
  };

  const handleAddToList = () => {
    if (!recipe) {
      return;
    }
    navigation.navigate('RecipeCreateList', { recipeId });
  };

  const handleAddToExisting = () => {
    if (!recipe) {
      return;
    }
    navigation.navigate('RecipeAddToList', { recipeId });
  };

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('recipes.notFound')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('recipes.detailsTitle')}</Text>
      <View style={styles.nameRow}>
        <TextInput
          style={[styles.nameInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
          value={nameDraft}
          onChangeText={setNameDraft}
          placeholder={t('recipes.namePlaceholder')}
          placeholderTextColor={theme.colors.muted}
        />
        <TouchableOpacity
          style={[
            styles.nameButton,
            { borderColor: theme.colors.primary, opacity: canSaveName && !isSavingName ? 1 : 0.5 },
          ]}
          onPress={handleSaveName}
          disabled={!canSaveName || isSavingName}
        >
          <Text style={[styles.nameButtonText, { color: theme.colors.primary }]}>
            {t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.formRow}>
        <TextInput
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          value={newItem}
          onChangeText={setNewItem}
          placeholder={t('recipes.ingredientPlaceholder')}
          placeholderTextColor={theme.colors.muted}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.primary, opacity: newItem.trim() ? 1 : 0.5 },
          ]}
          onPress={handleAddItem}
          disabled={!newItem.trim()}
        >
          <Text style={styles.primaryButtonText}>{t('recipes.addIngredient')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={itemsDraft}
        keyExtractor={(item, index) => `${recipe.id}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={[styles.itemRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            {editingIndex === index ? (
              <View style={styles.itemEditRow}>
                <TextInput
                  style={[styles.itemInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                  value={editingValue}
                  onChangeText={setEditingValue}
                  placeholder={t('recipes.ingredientPlaceholder')}
                  placeholderTextColor={theme.colors.muted}
                />
                <TouchableOpacity style={styles.iconButton} onPress={handleSaveItem} disabled={isSavingItem}>
                  <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleCancelEditItem}>
                  <MaterialIcons name="close" size={20} color={theme.colors.muted} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.itemContentRow}>
                <Text
                  style={[styles.itemText, { color: theme.colors.text }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item}
                </Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleStartEditItem(index)}>
                    <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteItem(index)}>
                    <MaterialIcons name="delete-outline" size={20} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
            {t('recipes.itemsEmpty')}
          </Text>
        }
      />
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddToList}
      >
        <Text style={styles.primaryButtonText}>{t('recipes.addToList')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
        onPress={handleAddToExisting}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
          {t('recipes.addToExisting')}
        </Text>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  nameButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  nameButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 40,
  },
  listContent: {
    paddingBottom: 12,
  },
  itemRow: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  itemContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontSize: 14,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
  },
  iconButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
