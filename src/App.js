import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';

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
