import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import { subscribeToUserRecipes } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';

const TILES = [
  {
    id: 'recipes',
    titleKey: 'templates.recipes.title',
    subtitleKey: 'templates.recipes.subtitle',
    screen: 'Recipes',
  },
];

export default function TemplatesScreen({ navigation }) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const numColumns = Platform.OS === 'web' ? 3 : 2;
  const [recipesCount, setRecipesCount] = useState(0);
  const tileWidth = Platform.OS === 'web' ? '32%' : '48%';

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return undefined;
    }
    return subscribeToUserRecipes(uid, (recipes) => {
      setRecipesCount(recipes.length);
    });
  }, []);

  const handlePress = (tile) => {
    if (tile.screen) {
      navigation.navigate(tile.screen);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('templates.title')}</Text>
      <FlatList
        data={TILES}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`tiles-${numColumns}`}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tile,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, width: tileWidth },
            ]}
            onPress={() => handlePress(item)}
          >
            <View style={[styles.tileImage, { backgroundColor: theme.colors.background }]} />
            <View style={styles.tileFooter}>
              <Text style={[styles.tileTitle, { color: theme.colors.text }]}>
                {t(item.titleKey)}
              </Text>
              <Text style={[styles.tileSubtitle, { color: theme.colors.muted }]}>
                {item.id === 'recipes'
                  ? t('recipes.count', { count: recipesCount })
                  : t(item.subtitleKey)}
              </Text>
            </View>
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
  row: {
    gap: 12,
    marginBottom: 12,
  },
  tile: {
    flexGrow: 0,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 140,
  },
  tileImage: {
    height: 90,
    borderRadius: 8,
  },
  tileFooter: {
    marginTop: 8,
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
});
