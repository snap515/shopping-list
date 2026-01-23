import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs.js';
import ListDetailsScreen from '../screens/Lists/ListDetailsScreen.js';
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
        name="Language"
        component={LanguageScreen}
        options={{ title: t('settings.language.title'), headerBackTitle: t('tabs.settings') }}
      />
    </Stack.Navigator>
  );
}
