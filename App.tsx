import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
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
  const [searchActive, setSearchActive] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const barAnim = useRef(new Animated.Value(50)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

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

  const openSearch = () => {
    setSearchActive(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSearch = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSearchActive(false);
      barAnim.setValue(30);
      barOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(barAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(barOpacity, {
          toValue: 1,
          duration: 10,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {region && <MapView initialRegion={region} showsUserLocation style={styles.map} />}
        {searchActive ? (
          <Animated.View
            style={[
              styles.fullScreenSearch,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
              placeholder="Enter destination"
              placeholderTextColor="#aaa"
              style={styles.fullInput}
              onBlur={closeSearch}
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.searchWrapper,
              { opacity: barOpacity, transform: [{ translateY: barAnim }] },
            ]}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Enter destination"
              placeholderTextColor="#aaa"
              onFocus={openSearch}
              style={styles.searchBar}
            />
          </Animated.View>
        )}
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

      setLoading(false);
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
