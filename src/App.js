import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';

const linking = {
  prefixes: ['http://localhost:19006', 'http://localhost:8081'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      Lists: 'lists',
      ListDetails: 'lists/:listId',
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
