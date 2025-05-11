import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Order } from '../../components/HistoryScreen'; // prispôsobi cestu

const KEY = 'orders_cache';

export const saveOrdersToCache = async (orders: Order[]) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(orders));
  } catch {}
};

export const loadOrdersFromCache = async (): Promise<Order[]> => {
  try {
    const val = await AsyncStorage.getItem(KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
};
