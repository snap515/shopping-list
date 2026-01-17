import { getPathFromState, getStateFromPath, NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';

const GH_PAGES_BASE = '/shopping-list';
const isGhPagesHost =
  typeof window !== 'undefined' && window.location.host.endsWith('github.io');

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
      Lists: 'lists',
      ListDetails: 'lists/:listId',
      Invites: 'invites',
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
    return isGhPagesHost ? `${GH_PAGES_BASE}${normalizedPath}` : normalizedPath;
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
