import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigation/types';

export interface Order {
  order_id: number;
  user_id: string;
  location: string;
  fuel_type: string;
  amount: number;
  company: string;
  price_per_liter: number;
  price: number;
  status: string;
  created_at: string;
}

type HistoryScreenProps = {
  session: Session;
};

export default function HistoryScreen({ session }: HistoryScreenProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Pre navigáciu k detailom objednávky
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Pomocná funkcia na skrátenie textu
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    fetchUserOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funkcia pre pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserOrders();
    setRefreshing(false);
  };

  // Zoskupenie objednávok podľa mesiaca a roku (napr. "Oct 2023")
  const groupOrdersByMonth = (orders: Order[]) => {
    const grouped: Record<string, Order[]> = {};
    orders.forEach((order) => {
      const dateObj = new Date(order.created_at);
      const month = dateObj.toLocaleString('en-US', { month: 'short' });
      const year = dateObj.getFullYear();
      const groupTitle = `${month} ${year}`;
      if (!grouped[groupTitle]) {
        grouped[groupTitle] = [];
      }
      grouped[groupTitle].push(order);
    });
    return Object.keys(grouped).map((title) => ({
      title,
      data: grouped[title],
    }));
  };

  const sections = groupOrdersByMonth(orders);

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderItem = ({ item }: { item: Order }) => {
    const dateObj = new Date(item.created_at);
    const day = dateObj.getDate();
    const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('HistoryDetail', { order: item });
        }}
        style={styles.itemContainer}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons name="car-outline" size={32} color="#80f17e" style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.itemLocation}>{item.location}</Text>
            <Text style={styles.itemDate}>
              {day} {monthName}, {hours}:{minutes < 10 ? '0' + minutes : minutes}
            </Text>
          </View>
        </View>
        {isEditing && (
          <TouchableOpacity onPress={() => {/* vymazanie funkcia */}} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        )}
        <Text style={styles.itemPrice}>{Number(item.price)?.toFixed(2)}€</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#80f17e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header s tlačidlom upraviť a názvom */}
      <View style={styles.header}>
        <Text style={styles.title}>{truncateText("My Rides", 25)}</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="#80f17e" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.order_id}-${index}`}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#80f17e"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d222a',
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    paddingTop: 20,
    color: '#fff',
    flex: 1,
  },
  editButton: {
    padding: 8,
    paddingTop:20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 10,
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2a2f3a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  itemLocation: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 14,
    color: '#999',
  },
  itemPrice: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  deleteButton: {
    marginRight: 10,
  },
});
