import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import ListsScreen from '../screens/Lists/ListsScreen.js';
import InvitesScreen from '../screens/Invites/InvitesScreen.js';
import SettingsScreen from '../screens/Settings/SettingsScreen.js';
import { t } from '../lib/i18n';
import { useLocale } from '../lib/i18n/LocaleProvider';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { locale } = useLocale();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarLabel: ({ color }) => (
          <Text style={[styles.tabLabel, { color }]}>
            {route.name === 'Lists' && t('tabs.lists')}
            {route.name === 'Invites' && t('tabs.invites')}
            {route.name === 'Settings' && t('tabs.settings')}
          </Text>
        ),
        headerTitle:
          route.name === 'Lists'
            ? t('tabs.lists')
            : route.name === 'Invites'
              ? t('tabs.invites')
              : t('tabs.settings'),
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      })}
      key={locale}
    >
      <Tab.Screen name="Lists" component={ListsScreen} />
      <Tab.Screen name="Invites" component={InvitesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 56,
  },
  tabBarItem: {
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 14,
  },
});
