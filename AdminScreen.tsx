import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { AdminStackParamList } from '../../AdminStack';

// ---------- Types ----------
export interface Order {
  order_id: number;
  user_id: string;
  location: string | null;
  status: string;
  is_approved: boolean;
  created_at: string;
}

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminHome'>;

// ---------- Component ----------
export default function AdminScreen() {
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  /** Fetch all orders not yet approved */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) Alert.alert('Chyba', error.message);
    else setOrders(data as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    // realtime subscription
    const channel = supabase
      .channel('orders_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);


  const approveOrder = async (order: Order) => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'Approved', is_approved: true, started_at: now })
      .eq('order_id', order.order_id)
      .select()
      .single();

    if (error) {
      console.error('Error approving order:', error.message);
      return Alert.alert('Error', 'Failed to approve order');
    }

    // navigate with updated row
    navigation.navigate('Navigation', { order: data });
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Objednávka #{item.order_id}</Text>
      <Text>Stav: {item.status}</Text>
      <Text>Adresa: {item.location ?? '–'}</Text>

      {!item.is_approved && (
        <TouchableOpacity style={styles.btn} onPress={() => approveOrder(item)}>
          <Text style={styles.btnText}>Approve & Navigate</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.order_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text>Žiadne objednávky.</Text>}
      />
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  btn: {
    marginTop: 12,
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    borderRadius: 6,
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
