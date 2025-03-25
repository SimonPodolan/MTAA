import React from 'react';
import { View, Image, ActivityIndicator } from 'react-native';

export const LoadingScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1C2129',
      }}>
      <Image
        source={require('../assets/logo.png')}
        style={{ width: 200, height: 300, marginBottom: 20 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#80f17e" />
    </View>
  );
};
