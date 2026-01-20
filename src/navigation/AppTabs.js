import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ListsScreen from '../screens/Lists/ListsScreen.js';
import InvitesScreen from '../screens/Invites/InvitesScreen.js';
import SettingsScreen from '../screens/Settings/SettingsScreen.js';
import { t } from '../lib/i18n';
import { useTheme } from '../lib/theme/ThemeProvider';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          const iconName =
            route.name === 'Lists'
              ? focused
                ? 'list'
                : 'list-outline'
              : route.name === 'Invites'
                ? focused
                  ? 'mail'
                  : 'mail-outline'
                : focused
                  ? 'settings'
                  : 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
      })}
    >
      <Tab.Screen
        name="Lists"
        component={ListsScreen}
        options={{ title: t('tabs.lists'), tabBarLabel: t('tabs.lists') }}
      />
      <Tab.Screen
        name="Invites"
        component={InvitesScreen}
        options={{ title: t('tabs.invites'), tabBarLabel: t('tabs.invites') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('tabs.settings'), tabBarLabel: t('tabs.settings') }}
      />
    </Tab.Navigator>
  );
}
