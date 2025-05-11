import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

type Order = {
  order_id: number;
  user_id: string;
  status: string;
  created_at: string;
};

const AdminScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Pending');

    if (error) {
      console.error('Error fetching orders:', error.message);
      Alert.alert('Error', 'Failed to fetch orders');
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  const approveOrder = async (orderId: number) => {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update({
        is_aproved: true,
        started_at: now
      })
      .eq('order_id', orderId);

    if (error) {
      console.error('Error approving order:', error.message);
      Alert.alert('Error', 'Failed to approve order');
    } else {
      Alert.alert('Success', 'Order approved successfully');
      fetchOrders(); // Refresh the order list
    }
  };


  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderText}>Order ID: {item.order_id}</Text>
      <Text style={styles.orderText}>User ID: {item.user_id}</Text>
      <Text style={styles.orderText}>Status: {item.status}</Text>
      <TouchableOpacity
        style={styles.approveButton}
        onPress={() => approveOrder(item.order_id)}
      >
        <Text style={styles.approveButtonText}>Approve</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Orders</Text>

      {loading ? (
        <Text>Loading orders...</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.order_id.toString()}
          renderItem={renderOrder}
          ListEmptyComponent={<Text>No pending orders found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  orderItem: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderText: {
    fontSize: 14,
    marginBottom: 6,
  },
  approveButton: {
    backgroundColor: '#1d222a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminScreen;
