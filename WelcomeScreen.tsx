import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigation/types'; // adjust the path if needed

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Get Started!</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.primaryText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.secondaryText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 30,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: '100%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryText: {
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#80f17e',
    borderRadius: 30,
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#80f17e',
    fontWeight: '600',
  },
});
