import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const Option = ({ icon, label }: { icon: IconName; label: string }) => (
  <TouchableOpacity style={styles.option}>
    <Ionicons name={icon} size={20} color="#80f17e" style={{ marginRight: 10 }} />
    <Text style={styles.optionText}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);

export const ProfileScreen = ({ session }: { session: Session }) => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  };

  const [fullName, setFullName] = useState('');
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setFullName(`${data.first_name} ${data.last_name}`);
      }
    };

    fetchProfile();
  }, []);

  useFocusEffect(() => {
    StatusBar.setBarStyle('light-content');
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={'light-content'} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>My Profile</Text>
        <TouchableOpacity style={styles.card}>
          <View>
            <Text style={styles.cardTitle}>{fullName}</Text>
            <Text style={styles.cardSubtitle}>{session.user.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <Option icon="gift" label="Referrals and rewards" />

        <Text style={styles.section}>Settings and Preferences</Text>
        <Option icon="notifications" label="Notifications" />
        <Option icon="language" label="Language" />
        <Option icon="shield-checkmark" label="Security" />

        <Text style={styles.section}>Support</Text>
        <Option icon="help-buoy" label="Help centre" />
        <Option icon="flag" label="Report a bug" />

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="red" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1d222a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1d222a',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#2a2f3a',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cardSubtitle: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 3,
  },
  section: {
    color: '#aaa',
    fontSize: 14,
    marginVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2f3a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    color: '#fff',
    fontSize: 15,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  logoutText: {
    color: 'red',
    marginLeft: 10,
    fontSize: 15,
  },
});
