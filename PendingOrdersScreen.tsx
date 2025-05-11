import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PendingOrdersScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Pending Orders Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PendingOrdersScreen;
