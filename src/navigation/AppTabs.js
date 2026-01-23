import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ListsScreen from '../screens/Lists/ListsScreen.js';
import InvitesScreen from '../screens/Invites/InvitesScreen.js';
import SettingsScreen from '../screens/Settings/SettingsScreen.js';
import { t } from '../lib/i18n';
import { useLocale } from '../lib/i18n/LocaleProvider';
import { useTheme } from '../lib/theme/ThemeProvider';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const labels = React.useMemo(
    () => ({
      Lists: t('tabs.lists'),
      Invites: t('tabs.invites'),
      Settings: t('tabs.settings'),
    }),
    [locale],
  );

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
        options={{ title: labels.Lists, tabBarLabel: labels.Lists }}
      />
      <Tab.Screen
        name="Invites"
        component={InvitesScreen}
        options={{ title: labels.Invites, tabBarLabel: labels.Invites }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: labels.Settings, tabBarLabel: labels.Settings }}
      />
    </Tab.Navigator>
  );
}
