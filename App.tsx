import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Keyboard, StatusBar } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { NavigationContainer, useFocusEffect, createNavigationContainerRef } from '@react-navigation/native';
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
import EditProfileScreen from './components/EditProfileScreen';
import type { Session } from '@supabase/supabase-js';
import OrderScreen from './components/OrderScreen';
import { RootStackParamList } from "./app/navigation/types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function LocationScreen() {
  return <View style={{ flex: 1, backgroundColor: '#1d222a' }} />;
}

const HomeScreen = ({ navigation }: any) => {
  const [region, setRegion] = useState<Region | null>(null);

  useFocusEffect(() => {
    StatusBar.setBarStyle('dark-content');
  });

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
    <View style={styles.container}>
      {region && <MapView initialRegion={region} showsUserLocation style={styles.map} />}
      <View style={styles.searchWrapper}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Order')}
          style={styles.searchBar}
          activeOpacity={0.7}>
          <Text style={styles.searchText}>Enter destination</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type MainTabsProps = {
  session: Session | null;
  navigation: any;
};

const MainTabs = ({ session, navigation }: MainTabsProps) => {
  return (
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
      <Tab.Screen name="Home">{() => <HomeScreen navigation={navigation} />}</Tab.Screen>
      <Tab.Screen name="Location" component={LocationScreen} />
      {session && (
        <Tab.Screen name="Profile">{() => <ProfileScreen session={session} />}</Tab.Screen>
      )}
    </Tab.Navigator>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [onboardingSeen, setOnboardingSeen] = useState<boolean>(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();

        if (!profile) {
          const { error: insertError } = await supabase.from('profiles').insert({
            user_id: data.session.user.id,
            first_name: 'First name',
            last_name: 'Last name',
            onboarding_seen: true,
          });

          if (insertError) {
            console.error('Error creating profile:', insertError.message);
          } else {
            console.log('Profile successfully created!');
          }
        }
      }

      setTimeout(() => setLoading(false), 1000);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (!profile && !profileError) {
          const { error: insertError } = await supabase.from('profiles').insert({
            user_id: session.user.id,
            first_name: 'First name',
            last_name: 'Last name',
            onboarding_seen: true,
          });

          if (insertError) {
            console.error('Error creating profile:', insertError.message);
          } else {
            console.log('Profile created via auth state change!');
          }
        }
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer ref={navigationRef}>
      {!session ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!onboardingSeen && <RootStack.Screen name="Splash" component={SplashScreen} />}
          {!onboardingSeen && <RootStack.Screen name="Welcome" component={WelcomeScreen} />}
          <RootStack.Screen name="SignUp" component={SignUpScreen} />
          <RootStack.Screen name="Success" component={SuccessScreen} />
          <RootStack.Screen name="SignIn" component={AuthScreen} />
        </RootStack.Navigator>
      ) : (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs">
            {({ navigation }) => <MainTabs navigation={navigation} session={session} />}
          </RootStack.Screen>
          <RootStack.Screen name="Order" component={OrderScreen} options={{ presentation: 'modal' }} />
          <RootStack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        </RootStack.Navigator>
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
    borderWidth: 1,
    borderColor: '#aaa',
    width: '90%',
  },
  searchText: {
    color: '#aaa',
    fontSize: 16,
  },
});
