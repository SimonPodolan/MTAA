import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigation/types';
import { Ionicons } from '@expo/vector-icons'; // adjust the path if needed

export default function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Error', error.message);
    else navigation.navigate('Success');
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.label}>Email Address</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="Create Password"
            placeholderTextColor="#888"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Continue'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2129',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 40,
  },
  label: {
    color: '#fff',
    marginBottom: 5,
    marginTop: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2f3a',
    paddingHorizontal: 10,
    borderRadius: 12,
    height: 50,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 15,
    marginTop: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1C2129',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
