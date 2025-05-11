import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import {
  useNavigation,
  useFocusEffect,
  useTheme,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigation/types';
import NetInfo from '@react-native-community/netinfo';
import {
  saveOrdersToCache,
  loadOrdersFromCache,
} from '../utils/offlineStorage';
import { Accelerometer } from 'expo-sensors';

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
  estimated_completion_time: string;
}

type HistoryScreenProps = {
  session: Session;
};

export default function HistoryScreen({ session }: HistoryScreenProps) {
  // ------------------- state -------------------
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ------------------- effects -------------------
  // NetInfo listener – sleduje pripojenie/odpojenie
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsub();
  }, []);

  // Načítanie cache + (ak online) fetch zo Supabase
  useEffect(() => {
    (async () => {
      const cachedOrders = await loadOrdersFromCache();
      if (cachedOrders?.length) setOrders(cachedOrders as Order[]);


      if (isConnected) fetchUserOrders(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, session.user.id]);

  // Nastav status bar v rámci obrazovky histórie
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
    }, []),
  );
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX + deltaY + deltaZ > 2) {
        if (orders.length > 0) {
          const latest = orders[0];
          handleDeleteOrder(latest.order_id);
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    });

    Accelerometer.setUpdateInterval(300);
    return () => subscription.remove();
  }, [orders]);

  // ------------------- fetch -------------------
  const fetchUserOrders = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
        await saveOrdersToCache(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  // ------------------- handlers -------------------
  const handleRefresh = async () => {
    if (!isConnected) return; // offline – nerefreshuj

    setRefreshing(true);
    await fetchUserOrders(false);
    setRefreshing(false);
  };

  const handleDeleteOrder = async (order_id: number) => {
    Alert.alert('Delete Order', 'Are you sure you want to delete this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('orders')
              .delete()
              .eq('order_id', order_id);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              setOrders((prev) => prev.filter((o) => o.order_id !== order_id));
              await saveOrdersToCache(
                orders.filter((o) => o.order_id !== order_id),
              );
            }
          } catch (err) {
            console.error('Unexpected error:', err);
          }
        },
      },
    ]);
  };

  // ------------------- utils -------------------
  const groupOrdersByMonth = (orders: Order[]) => {
    const grouped: Record<string, Order[]> = {};
    orders.forEach((order) => {
      const dateObj = new Date(order.created_at);
      const month = dateObj.toLocaleString('en-US', { month: 'short' });
      const year = dateObj.getFullYear();
      const groupTitle = `${month} ${year}`;
      if (!grouped[groupTitle]) grouped[groupTitle] = [];
      grouped[groupTitle].push(order);
    });
    return Object.keys(grouped).map((title) => ({
      title,
      data: grouped[title],
    }));
  };

  const sections = groupOrdersByMonth(orders);

  // ------------------- render -------------------
  const renderSectionHeader = ({
                                 section: { title },
                               }: {
    section: { title: string };
  }) => <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>;

  const renderItem = ({ item }: { item: Order }) => {
    const dateObj = new Date(item.created_at);
    const day = dateObj.getDate();
    const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    const commonLeft = (
      <>
        <Ionicons
          name="car-outline"
          size={32}
          color="#80f17e"
          style={{ marginRight: 10 }}
        />
        <View>
          <Text
            numberOfLines={2}
            style={[styles.itemLocation, { color: colors.text }]}
          >
            {item.location}
          </Text>
          <Text style={[styles.itemDate, { color: colors.text }]}> {day} {monthName}, {hours}:{minutes < 10 ? '0' + minutes : minutes}</Text>
        </View>
      </>
    );

    if (!isEditing) {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('HistoryDetail', { order: item })}
          style={[styles.itemContainer, { backgroundColor: colors.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {commonLeft}
          </View>
          <Text style={[styles.itemPrice, { color: colors.text }]}>
            {Number(item.price)?.toFixed(2)}€
          </Text>
        </TouchableOpacity>
      );
    }

    // edit mode
    return (
      <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {commonLeft}
        </View>
        <View style={styles.rightContainer}>
          <Text style={[styles.itemPrice, { color: colors.text }]}>
            {Number(item.price)?.toFixed(2)}€
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteOrder(item.order_id)}
            style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ------------------- jsx -------------------
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Rides</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}>
          <Ionicons
            name={isEditing ? 'checkmark-outline' : 'create-outline'}
            size={30}
            color="#80f17e"
          />
        </TouchableOpacity>
      </View>

      {!isConnected && (
        <Text
          style={{
            color: 'orange',
            textAlign: 'center',
            marginVertical: 4,
          }}>
          Ste offline – zobrazujú sa uložené údaje.
        </Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#80f17e" style={{ marginTop: 40 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.order_id}-${index}`}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#80f17e"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    color: '#fff',
    flex: 1,
    paddingTop: 60,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
    paddingTop: 60,
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
    flex: 1,
    marginRight: 50,
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
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2f3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});