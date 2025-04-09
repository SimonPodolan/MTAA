import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../app/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HistoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'HistoryDetail'>;
type HistoryDetailScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'HistoryDetail'>;

function HistoryDetailScreen() {
  const navigation = useNavigation<HistoryDetailScreenNavProp>();
  const route = useRoute<HistoryDetailScreenRouteProp>();
  const { order } = route.params;

  // Pomocná funkcia na formátovanie dátumu
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    // Napr. "20 Oct 2023"
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Obsah detailu */}
      <View style={styles.row}>
        <Ionicons name="location-outline" size={24} color="#80f17e" style={styles.icon} />
        <Text style={styles.rowText}>{order.location}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="flash-outline" size={24} color="#80f17e" style={styles.icon} />
        <Text style={styles.rowText}>{order.fuel_type}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="business-outline" size={24} color="#80f17e" style={styles.icon} />
        <Text style={styles.rowText}>{order.company}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="thermometer-outline" size={24} color="#80f17e" style={styles.icon} />
        <Text style={styles.rowText}>{order.amount} L</Text>
      </View>

      {/* distance je len príklad – ak ho ukladáte do DB, použite order.distance */}
      <View style={styles.row}>
        <Ionicons name="walk-outline" size={24} color="#80f17e" style={styles.icon} />
        <Text style={styles.rowText}>Distance: 30km</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="cash-outline" size={24} color="#80f17e" style={styles.icon} />
        <Text style={styles.rowText}>{order.price?.toFixed(2)} $</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={24} color="#80f17e" style={styles.icon} />
        <Text style={styles.rowText}>{formatDate(order.created_at)}</Text>
      </View>
    </View>
  );
}

export default HistoryDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d222a',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 30,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  icon: {
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2f3a',
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
  },
  rowText: {
    color: '#fff',
    fontSize: 16,
  },
});
