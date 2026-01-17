import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import ListsScreen from '../screens/Lists/ListsScreen.js';
import InvitesScreen from '../screens/Invites/InvitesScreen.js';
import SettingsScreen from '../screens/Settings/SettingsScreen.js';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarLabel: ({ color }) => (
          <Text style={[styles.tabLabel, { color }]}>{route.name}</Text>
        ),
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      })}
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
