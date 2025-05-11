import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp, CommonActions, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../app/navigation/types';
import { Ionicons } from '@expo/vector-icons';

type SuccessScreenRouteProp = RouteProp<RootStackParamList, 'SuccessScreen'>;

export default function SuccessScreen() {
  const route = useRoute<SuccessScreenRouteProp>();
  const navigation = useNavigation();
  const { onComplete } = route.params;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
      // Reset the navigation stack and navigate to MainTabs
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, onComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#80f17e" />
        </View>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>Your order has been confirmed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d222a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },
});
