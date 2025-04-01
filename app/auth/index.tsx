import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.label}>E-mail</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#555"
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
            placeholder="Password"
            placeholderTextColor="#555"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#aaa"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgot}>
          <Ionicons name="information-circle-outline" size={14} color="#80f17e" />
          <Text style={styles.forgotText}> Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loading}>
          <Text style={styles.buttonText}>Sign In</Text>
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
  forgot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  forgotText: {
    color: '#ccc',
    fontSize: 13,
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
