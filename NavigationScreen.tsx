import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { RouteProp } from '@react-navigation/native';
import type { AdminStackParamList } from '../../AdminStack';

export type NavigationScreenRouteProp = RouteProp<AdminStackParamList, 'Navigation'>;

type Props = {
  route: NavigationScreenRouteProp;
};

export default function NavigationScreen({ route }: Props) {
  const { order } = route.params;

  const startNavigation = () => {
    if (!order?.location) {
      Alert.alert('Chýba adresa', 'Táto objednávka nemá uloženú adresu.');
      return;
    }
    const dest = encodeURIComponent(order.location);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Objednávka #{order.id}</Text>
      <Text style={styles.label}>Adresa doručenia:</Text>
      <Text style={styles.location}>{order.location}</Text>

      <TouchableOpacity style={styles.button} onPress={startNavigation}>
        <Text style={styles.buttonText}>Navigovať</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  location: { fontSize: 18, marginBottom: 32 },
  button: {
    alignSelf: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
