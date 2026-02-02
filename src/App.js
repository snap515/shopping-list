import { getPathFromState, getStateFromPath, NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import { LocaleProvider, useLocale } from './lib/i18n/LocaleProvider';
import { ToastProvider } from './lib/toast';
import { ThemeProvider, useTheme } from './lib/theme/ThemeProvider';

const GH_PAGES_BASE = '/shopping-list';
const isGhPagesHost =
  typeof window !== 'undefined' &&
  window.location &&
  window.location.host &&
  window.location.host.endsWith('github.io');
const useHashRouting = isGhPagesHost;

const baseUrl = Linking.createURL('/');

const linking = {
  prefixes: [
    baseUrl,
    'https://snap515.github.io/shopping-list',
    'http://localhost:19006',
    'http://localhost:8081',
  ],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      Tabs: {
        screens: {
          Lists: 'lists',
          Invites: 'invites',
          Templates: 'templates',
          Settings: 'settings',
        },
      },
      ListDetails: 'lists/:listId',
      ListInfo: 'list/:listId/settings',
      Recipes: 'templates/recipes',
      RecipeEditor: 'templates/recipes/new',
      RecipeDetails: 'templates/recipes/:recipeId',
      RecipeAddToList: 'templates/recipes/:recipeId/add',
      RecipeCreateList: 'templates/recipes/:recipeId/create',
      TemplateEditor: 'templates/new',
      TemplateSets: 'templates/:templateId',
      TemplateSetEditor: 'templates/:templateId/new',
      TemplateSetDetails: 'templates/:templateId/sets/:setId',
      TemplateSetAddToList: 'templates/:templateId/sets/:setId/add',
      TemplateSetCreateList: 'templates/:templateId/sets/:setId/create',
      Language: 'settings/language',
    },
  },
  getStateFromPath: (path, options) => {
    const cleanedPath =
      isGhPagesHost && path.startsWith(GH_PAGES_BASE)
        ? path.slice(GH_PAGES_BASE.length) || '/'
        : path;
    return getStateFromPath(cleanedPath, options);
  },
  getPathFromState: (state, options) => {
    const rawPath = getPathFromState(state, options);
    const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    if (!useHashRouting) {
      return isGhPagesHost ? `${GH_PAGES_BASE}${normalizedPath}` : normalizedPath;
    }
    return `${GH_PAGES_BASE}/#${normalizedPath}`;
  },
  getInitialURL: () => {
    if (!useHashRouting || typeof window === 'undefined') {
      return Linking.createURL('/');
    }
    const { pathname, hash } = window.location;
    const path = pathname.replace(GH_PAGES_BASE, '') || '/';
    const hashPath = hash ? hash.replace('#', '') : path;
    return `${window.location.origin}${GH_PAGES_BASE}/#${hashPath}`;
  },
};

function AppContainer() {
  const { locale } = useLocale();
  const { theme } = useTheme();

  return (
    <NavigationContainer
      documentTitle={{
        formatter: (options, route) => options?.title || 'shopping-list',
      }}
      linking={linking}
      theme={{
        dark: theme.id === 'dark',
        colors: {
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
          notification: theme.colors.primary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '600' },
          heavy: { fontFamily: 'System', fontWeight: '700' },
        },
      }}
    >
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <ToastProvider>
            <AppContainer />
          </ToastProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
