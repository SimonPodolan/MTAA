import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Alert, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import { navigationRef } from '../App';
import { useThemeContext } from '../context/ThemeContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const Option = ({ icon, label }: { icon: IconName; label: string }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.option, { backgroundColor: colors.card }]}>
      <Ionicons name={icon} size={20} color="#80f17e" style={{ marginRight: 10 }} />
      <Text style={[styles.optionText, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.text} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
};

export const ProfileScreen = ({ session }: { session: Session }) => {
  const navigation = useNavigation<any>();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { theme, toggleTheme } = useThemeContext();
  const { colors } = useTheme();
  const statusBarStyle = theme === 'dark' ? 'light-content' : 'dark-content';


  const handleLogout = async () => {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ onboarding_seen: false })
      .eq('user_id', session.user.id);

    if (updateError) {
      Alert.alert('Error', updateError.message);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setFullName(`${data.first_name} ${data.last_name}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  useFocusEffect(() => {
    StatusBar.setBarStyle('light-content');
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={'light-content'} />
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.background, padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#80f17e" />
        }>
        <Text style={[styles.header, { color: colors.text }]}>My Profile</Text>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('EditProfileScreen', { session });
            } else {
              console.error('Navigation is not ready');
            }
          }}>
          <View>
            <Text style={styles.cardTitle}>{fullName}</Text>
            <Text style={styles.cardSubtitle}>{session.user.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="red" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }} onPress={toggleTheme}>
          <Ionicons name="contrast" size={18} color="#80f17e" />
          <Text style={{ color: '#80f17e', marginLeft: 10 }}>
            Prepni na {theme === 'dark' ? 'Light' : 'Dark'} režim
          </Text>
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
    flexGrow: 1,
    backgroundColor: '#1d222a',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    paddingTop: 60,
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