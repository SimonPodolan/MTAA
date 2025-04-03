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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [FirstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        first_name: FirstName,
        last_name: LastName,
        onboarding_seen: true,
      });

      if (insertError) {
        Alert.alert('Insert error', insertError.message);
      } else {
        navigation.navigate('Success');
      }
    }

    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.label}>First Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="Name"
            placeholderTextColor="#888"
            style={styles.input}
            value={FirstName}
            onChangeText={setFirstName}
          />
        </View>

        <Text style={styles.label}>Last Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="Surname"
            placeholderTextColor="#888"
            style={styles.input}
            value={LastName}
            onChangeText={setLastName}
          />
        </View>

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
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            style={styles.input}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
