import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import { deleteRecipe, subscribeToUserRecipes } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useToast } from '../../lib/toast';

export default function RecipesScreen({ navigation }) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState([]);
  const numColumns = Platform.OS === 'web' ? 3 : 2;
  const tileWidth = Platform.OS === 'web' ? '32%' : '48%';
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return undefined;
    }
    return subscribeToUserRecipes(uid, setRecipes);
  }, []);

  const data = useMemo(
    () => [{ id: 'add-recipe', isAdd: true }, ...recipes],
    [recipes]
  );

  const handleDelete = (recipe) => {
    const runDelete = async () => {
      if (deletingId) {
        return;
      }
      setDeletingId(recipe.id);
      try {
        await deleteRecipe(recipe.id);
        showToast(t('recipes.deleteToast', { name: recipe.name }));
      } catch (error) {
        showToast(t('recipes.deleteError'));
      } finally {
        setDeletingId(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${t('recipes.deleteTitle')}\n${t('recipes.deleteMessage', { name: recipe.name })}`
      );
      if (confirmed) {
        runDelete();
      }
      return;
    }

    Alert.alert(
      t('recipes.deleteTitle'),
      t('recipes.deleteMessage', { name: recipe.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: runDelete },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('recipes.title')}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`recipes-${numColumns}`}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
            {t('recipes.empty')}
          </Text>
        }
        renderItem={({ item }) => {
          if (item.isAdd) {
            return (
              <TouchableOpacity
                style={[
                  styles.tile,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, width: tileWidth },
                ]}
                onPress={() => navigation.navigate('RecipeEditor')}
              >
                <View style={[styles.tileBody, { backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={[styles.addTitle, { color: theme.colors.primary }]}>+</Text>
                </View>
                <View style={styles.tileFooter}>
                  <Text style={[styles.tileTitle, { color: theme.colors.text }]}>
                    {t('recipes.addRecipe')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }

          const count = Array.isArray(item.items) ? item.items.length : 0;
          return (
            <TouchableOpacity
              style={[
                styles.tile,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, width: tileWidth },
              ]}
              onPress={() => navigation.navigate('RecipeDetails', { recipeId: item.id })}
            >
              <View style={[styles.tileBody, { backgroundColor: theme.colors.background }]}>
                <TouchableOpacity
                  style={styles.deleteBadge}
                  onPress={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                >
                  <Text style={[styles.deleteText, { color: theme.colors.danger }]}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tileFooter}>
                <Text
                  style={[styles.tileTitle, { color: theme.colors.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.tileSubtitle, { color: theme.colors.muted }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {t('recipes.itemsCount', { count })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
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
  row: {
    gap: 12,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  tile: {
    flexGrow: 0,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 140,
  },
  tileBody: {
    height: 90,
    borderRadius: 8,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  tileFooter: {
    marginTop: 8,
  },
  deleteBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteText: {
    fontSize: 18,
    fontWeight: '700',
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  tileSubtitle: {
    marginTop: 4,
    fontSize: 12,
  },
  addTitle: {
    fontSize: 32,
    fontWeight: '600',
  },
});
