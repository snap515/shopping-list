import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import { addItemsToList, subscribeToUserLists, subscribeToUserRecipes } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function RecipeAddToListScreen({ route, navigation }) {
  const { recipeId } = route.params || {};
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [lists, setLists] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return undefined;
    }
    return subscribeToUserLists(uid, setLists);
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid || !recipeId) {
      return undefined;
    }
    return subscribeToUserRecipes(uid, (items) => {
      const next = items.find((item) => item.id === recipeId) || null;
      setRecipe(next);
    });
  }, [recipeId]);

  const handleAdd = async (list) => {
    if (!recipe || isAdding) {
      return;
    }

    setIsAdding(true);
    try {
      await addItemsToList({
        listId: list.id,
        items: recipe.items || [],
        createdByUid: auth.currentUser?.uid || 'unknown',
        createdByEmail: auth.currentUser?.email || '',
      });
      showToast(t('recipes.addedToExistingToast', { name: list.name }));
      navigation.goBack();
    } catch (error) {
      showToast(t('recipes.toastError'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('recipes.selectList')}
      </Text>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
            {t('recipes.noLists')}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
            onPress={() => handleAdd(item)}
            disabled={isAdding}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.name}</Text>
            <Text style={[styles.cardMeta, { color: theme.colors.muted }]}>
              {t('lists.membersCount')} {item.memberUids?.length || 0}
            </Text>
          </TouchableOpacity>
        )}
      />
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
  listContent: {
    paddingBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardMeta: {
    marginTop: 4,
  },
});
