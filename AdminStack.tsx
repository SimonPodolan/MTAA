import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminScreen from './components/Admin/AdminScreen';
import PendingOrdersScreen from './components/Admin/PendingOrdersScreen';

export type AdminStackParamList = {
  Admin: undefined;
  PendingOrders: undefined;
};

const AdminStack = createNativeStackNavigator<AdminStackParamList>();

const AdminStackScreen = () => (
  <AdminStack.Navigator screenOptions={{ headerShown: false }}>
    <AdminStack.Screen name="Admin" component={AdminScreen} />
    <AdminStack.Screen name="PendingOrders" component={PendingOrdersScreen} />
  </AdminStack.Navigator>
);

export default AdminStackScreen;
