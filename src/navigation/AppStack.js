import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListsScreen from '../screens/Lists/ListsScreen.js';
import ListDetailsScreen from '../screens/Lists/ListDetailsScreen.js';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Lists" component={ListsScreen} />
      <Stack.Screen name="ListDetails" component={ListDetailsScreen} />
    </Stack.Navigator>
  );
}
