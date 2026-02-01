import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs.js';
import ListDetailsScreen from '../screens/Lists/ListDetailsScreen.js';
import ListInfoScreen from '../screens/Lists/ListInfoScreen.js';
import RecipesScreen from '../screens/Templates/RecipesScreen.js';
import RecipeDetailsScreen from '../screens/Templates/RecipeDetailsScreen.js';
import RecipeEditorScreen from '../screens/Templates/RecipeEditorScreen.js';
import RecipeAddToListScreen from '../screens/Templates/RecipeAddToListScreen.js';
import RecipeCreateListScreen from '../screens/Templates/RecipeCreateListScreen.js';
import LanguageScreen from '../screens/Settings/LanguageScreen.js';
import { t } from '../lib/i18n';
import { useLocale } from '../lib/i18n/LocaleProvider';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  const { locale } = useLocale();

  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="ListDetails"
        component={ListDetailsScreen}
        options={{ title: t('listDetails.title'), headerBackTitle: t('tabs.lists') }}
      />
      <Stack.Screen
        name="ListInfo"
        component={ListInfoScreen}
        options={{ title: t('listInfo.title'), headerBackTitle: t('tabs.lists') }}
      />
      <Stack.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{ title: t('recipes.title'), headerBackTitle: t('tabs.templates') }}
      />
      <Stack.Screen
        name="RecipeEditor"
        component={RecipeEditorScreen}
        options={{ title: t('recipes.createTitle'), headerBackTitle: t('recipes.title') }}
      />
      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetailsScreen}
        options={{ title: t('recipes.detailsTitle'), headerBackTitle: t('recipes.title') }}
      />
      <Stack.Screen
        name="RecipeAddToList"
        component={RecipeAddToListScreen}
        options={{ title: t('recipes.selectList'), headerBackTitle: t('recipes.detailsTitle') }}
      />
      <Stack.Screen
        name="RecipeCreateList"
        component={RecipeCreateListScreen}
        options={{ title: t('recipes.createListTitle'), headerBackTitle: t('recipes.detailsTitle') }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ title: t('settings.language.title'), headerBackTitle: t('tabs.settings') }}
      />
    </Stack.Navigator>
  );
}
