import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar, ActivityIndicator, Vibration, Alert } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  NavigationContainer,
  useFocusEffect,
  createNavigationContainerRef,
  useTheme
} from '@react-navigation/native';
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
import { RootStackParamList } from './app/navigation/types';
import HistoryScreen from './components/HistoryScreen';
import HistoryDetailScreen from './components/HistoryDetailScreen';
import PaymentScreen from './components/PaymentScreen';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import { customDarkTheme, customLightTheme } from './theme/themes';
import AdminStackScreen from './AdminStack';
import * as Notifications from 'expo-notifications';



export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function LocationScreen() {
  return <View style={{ flex: 1, backgroundColor: '#1d222a' }} />;
}

const HomeScreen = ({ navigation }: any) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const updateOrderStatus = async (orderId: number, shouldVibrate = true) => {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'Completed' })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
    } else {
      // Vibrate and show alert when order is completed
      if (shouldVibrate) {
        Vibration.vibrate(1000);
        Alert.alert(
          "Order Completed! 🎉",
          "Your fuel delivery has been completed. Thank you for using our service!",
          [{ text: "OK", style: "default" }]
        );
      }
    }
    setActiveOrder(null);
  };

  const fetchActiveOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setActiveOrder(null);
        return;
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['Approved', 'Completed'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching orders:', error);
        setActiveOrder(null);
        return;
      }

      if (orders && orders.length > 0) {
        const order = orders[0];

        // Check if the order is approved and not yet completed
        if (order.status === 'Approved') {
          setActiveOrder(order);
        } else {
          setActiveOrder(null);
        }
      } else {
        setActiveOrder(null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setActiveOrder(null);
    }
  };


  useEffect(() => {
    fetchActiveOrder();
    const interval = setInterval(fetchActiveOrder, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimeLeft = (estimatedTime: string) => {
    if (!activeOrder || activeOrder.status !== 'Approved') {
      return 'Waiting for admin approval...';
    }

    const now = new Date().getTime();
    const estimatedDate = new Date(estimatedTime).getTime();
    const difference = estimatedDate - now;

    if (difference <= 0) {
      if (activeOrder) {
        updateOrderStatus(activeOrder.order_id, true); // Vibrate when timer reaches zero
      }
      return '0s';
    }

    const seconds = Math.ceil(difference / 1000);
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };


  const calculateDistance = () => {
    return '8km';
  };

  return (
    <View style={styles.container}>
      {region && <MapView initialRegion={region} showsUserLocation style={styles.map} />}
      <View style={styles.searchWrapper}>
        {isLoading ? (
          <View style={styles.activeOrderContainer}>
            <ActivityIndicator color="#1d222a" />
          </View>
        ) : activeOrder ? (
          <View style={styles.activeOrderContainer}>
            <View style={styles.activeOrderInfo}>
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceText}>{calculateDistance()}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {calculateTimeLeft(activeOrder.estimated_completion_time)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.pendingButton}
              disabled={true}>
              <Text style={styles.pendingButtonText}>Pending...</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('Order')}
            style={styles.searchBar}
            activeOpacity={0.7}>
            <Text style={styles.searchText}>Enter destination</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

type MainTabsProps = {
  session: Session | null;
  navigation: any;
};

const MainTabs = ({ session, navigation }: MainTabsProps) => {

  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.card },
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'map';
          if (route.name === 'Home') iconName = 'home-outline';
          if (route.name === 'History') iconName = 'time-outline';
          if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home">
        {() => <HomeScreen navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name="History">
        {() => <HistoryScreen session={session!} />}
      </Tab.Screen>
      {session && (
        <Tab.Screen name="Profile">
          {() => <ProfileScreen session={session} />}
        </Tab.Screen>
      )}
    </Tab.Navigator>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [onboardingSeen, setOnboardingSeen] = useState<boolean>(false);

  const { theme } = useThemeContext();
  const currentTheme = theme === 'dark' ? customDarkTheme : customLightTheme;


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
        } else {
          setOnboardingSeen(profile.onboarding_seen);
        }
      } else {
        // If no session, check if we need to show onboarding
        const { data: profileData } = await supabase
          .from('profiles')
          .select('onboarding_seen')
          .eq('user_id', 'temp')
          .single();

        if (!profileData || profileData.onboarding_seen === false) {
          setOnboardingSeen(false);
        }
      }

      setTimeout(() => setLoading(false), 1000);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
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
        } else if (profile) {
          setOnboardingSeen(profile.onboarding_seen);
        }
      } else {
        // When logged out, check if we need to show onboarding
        const { data: profileData } = await supabase
          .from('profiles')
          .select('onboarding_seen')
          .eq('user_id', 'temp')
          .single();

        // If no profile data or onboarding_seen is false, set onboardingSeen to false
        if (!profileData || profileData.onboarding_seen === false) {
          setOnboardingSeen(false);
        }
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer theme={currentTheme} ref={navigationRef}>
      {!session ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!onboardingSeen && <RootStack.Screen name="Splash" component={SplashScreen} />}
          {!onboardingSeen && <RootStack.Screen name="Welcome" component={WelcomeScreen} />}
          <RootStack.Screen name="SignUp" component={SignUpScreen} />
          <RootStack.Screen name="SignIn" component={AuthScreen} />
        </RootStack.Navigator>
      ) : (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs">
            {({ navigation }) => <MainTabs navigation={navigation} session={session} />}
          </RootStack.Screen>
          <RootStack.Screen
            name="Order"
            component={OrderScreen}
            options={{ presentation: 'modal' }}
          />
          <RootStack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          <RootStack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
          <RootStack.Screen name="Payment" component={PaymentScreen} />
          <RootStack.Screen name="AdminStack" component={AdminStackScreen} />
          <RootStack.Screen
            name="SuccessScreen"
            component={SuccessScreen}
            options={{
              presentation: 'modal',
              animation: 'fade'
            }}
          />
        </RootStack.Navigator>
      )}
    </NavigationContainer>

  );
}
export default function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
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
  activeOrderContainer: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeOrderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  distanceContainer: {
    flex: 1,
  },
  distanceText: {
    color: '#1d222a',
    fontSize: 16,
    fontWeight: '600',
  },
  timeContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeText: {
    color: '#1d222a',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingButton: {
    backgroundColor: '#1d222a',
    width: '100%',
    padding: 15,
    alignItems: 'center',
  },
  pendingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});