import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigation/types';

type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

const PaymentScreen = () => {
  const navigation = useNavigation<PaymentScreenNavProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { orderDetails } = route.params;
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create the order in database after successful payment
      const now = new Date();
      const { data: order, error } = await supabase.from('orders').insert({
        ...orderDetails,
        status: 'Pending',
        created_at: now.toISOString(),
      }).select().single();

      if (error) throw error;

      // Navigate to Success screen
      navigation.navigate('SuccessScreen', {
        onComplete: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }
      });

    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Order Summary</Text>
          
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Location</Text>
            <Text style={styles.rowValue} numberOfLines={2}>{orderDetails.location}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Fuel Type</Text>
            <Text style={styles.rowValue}>{orderDetails.fuel_type}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Amount</Text>
            <Text style={styles.rowValue}>{orderDetails.amount}L</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Company</Text>
            <Text style={styles.rowValue}>{orderDetails.company}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{orderDetails.price?.toFixed(2)}€</Text>
          </View>
          
          <View style={styles.timeEstimateContainer}>
            <Ionicons name="time-outline" size={20} color="#80f17e" />
            <Text style={styles.timeEstimateText}>
              Estimated completion: {new Date(orderDetails.estimated_completion_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1d222a" />
          ) : (
            <>
              <Ionicons name="card-outline" size={24} color="#1d222a" />
              <Text style={styles.payButtonText}>Pay Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d222a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f3a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#2a2f3a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    color: '#aaa',
    fontSize: 16,
  },
  rowValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3f4a',
    marginVertical: 16,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    color: '#80f17e',
    fontSize: 24,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#80f17e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#1d222a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeEstimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#3a3f4a',
  },
  timeEstimateText: {
    color: '#80f17e',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default PaymentScreen; 