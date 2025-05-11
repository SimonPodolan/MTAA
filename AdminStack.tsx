// navigation/AdminStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminScreen from './components/Admin/AdminScreen';
import NavigationScreen from './components/Admin/NavigationScreen';

export type AdminStackParamList = {
  AdminHome: undefined;
  Navigation: { order: any };
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminHome">
      <Stack.Screen
        name="AdminHome"
        component={AdminScreen}
        options={{ title: 'Objednávky' }}
      />
      <Stack.Screen
        name="Navigation"
        component={NavigationScreen}
        options={{ title: 'Navigácia' }}
      />
    </Stack.Navigator>
  );
}
