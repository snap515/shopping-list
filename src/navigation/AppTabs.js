import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListsScreen from '../screens/Lists/ListsScreen.js';
import InvitesScreen from '../screens/Invites/InvitesScreen.js';
import SettingsScreen from '../screens/Settings/SettingsScreen.js';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Lists" component={ListsScreen} />
      <Tab.Screen name="Invites" component={InvitesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
