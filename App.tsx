import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LoadingScreen } from './components/LoadingScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { supabase } from './lib/supabase';
import AuthScreen from './app/auth';
import SplashScreen from './components/SplashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import SignUpScreen from './components/SignUpScreen';
import SuccessScreen from './components/SuccessScreen';
import type { Session } from '@supabase/supabase-js';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const HomeScreen = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {region && <MapView initialRegion={region} showsUserLocation style={styles.map} />}
        <View style={styles.searchWrapper}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Enter destination"
            placeholderTextColor="#aaa"
            style={styles.searchBar}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const DummyScreen = () => <View style={{ flex: 1, backgroundColor: '#1d222a' }} />;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [onboardingSeen, setOnboardingSeen] = useState<boolean>(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_seen')
          .eq('id', data.session.user.id)
          .single();
        setOnboardingSeen(profile?.onboarding_seen ?? false);
      }

      setTimeout(() => setLoading(false), 1000);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {!session ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!onboardingSeen && <RootStack.Screen name="Splash" component={SplashScreen} />}
          {!onboardingSeen && <RootStack.Screen name="Welcome" component={WelcomeScreen} />}
          <RootStack.Screen name="SignUp" component={SignUpScreen} />
          <RootStack.Screen name="Success" component={SuccessScreen} />
          <RootStack.Screen name="SignIn" component={AuthScreen} />
        </RootStack.Navigator>
      ) : (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: { backgroundColor: '#1d222a' },
            tabBarActiveTintColor: '#80f17e',
            tabBarIcon: ({ color, size }) => {
              let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'map';
              if (route.name === 'Location') iconName = 'location';
              if (route.name === 'Profile') iconName = 'person';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Location" component={DummyScreen} />
          <Tab.Screen name="Profile">{() => <ProfileScreen session={session} />}</Tab.Screen>
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchWrapper: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: '#1d222a',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 12,
    color: 'white',
    fontSize: 16,
    width: '90%',
    marginTop: 10,
    elevation: 5,
  },
  fullScreenSearch: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1d222a',
    paddingTop: 80,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  fullInput: {
    backgroundColor: '#2a2f3a',
    color: 'white',
    padding: 15,
    borderRadius: 12,
    fontSize: 18,
  },
});
