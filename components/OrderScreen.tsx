import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigation/types';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';


const OrderScreen = () => {
  useFocusEffect(() => {
    StatusBar.setBarStyle('light-content');
  });

  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [fuelType, setFuelType] = useState<'Gasoline' | 'Diesel'>('Gasoline');
  const [fuelVariant, setFuelVariant] = useState('FuelSave');
  const [amount, setAmount] = useState(10);
  const [company, setCompany] = useState('Slovnaft');
  const [loading, setLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string>('');

  const pricePerLiter = 1.81;
  const estimatedPrice = (pricePerLiter * amount).toFixed(2);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Calculate estimated completion time based on order details
  useEffect(() => {
    // Base time in seconds (30 seconds)
    let baseTime = 5;
    
    // Add time based on amount (2 seconds per liter)
    const amountTime = amount * 2;
    
    // Add time based on company (different companies have different service speeds)
    let companyTime = 0;
    if (company === 'Slovnaft') companyTime = 1;
    else if (company === 'SHELL') companyTime = 10;
    else if (company === 'OMV') companyTime = 12;
    
    // Calculate total time in seconds
    const totalSeconds = baseTime + amountTime + companyTime;
    
    // Convert to minutes if needed
    if (totalSeconds >= 60) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setEstimatedTime(`${minutes}m ${seconds}s`);
    } else {
      setEstimatedTime(`${totalSeconds}s`);
    }
  }, [amount, company]);

  const fetchLocations = async (query: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=d18dec65432c48589fbb9bde6f471e36`
      );
      const data = await res.json();
      const names = data.features.map((item: any) => item.properties.formatted);
      setSuggestions(names);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.length > 2) {
      fetchLocations(location);
    } else {
      setSuggestions([]);
    }
  }, [location]);

  const handleSuggestionPress = (suggestion: string) => {
    setLocation(suggestion);
    setSuggestions([]);
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&apiKey=d18dec65432c48589fbb9bde6f471e36`
      );
      const data = await res.json();
      const name = data.features?.[0]?.properties?.formatted;
      if (name) setLocation(name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please log in to create an order');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        alert('User profile not found. Please complete your registration first.');
        return;
      }

      // Calculate estimated completion time
      const now = new Date();
      // Convert the time string to seconds for calculation
      const timeInSeconds = estimatedTime.includes('m') 
        ? parseInt(estimatedTime.split('m')[0]) * 60 + parseInt(estimatedTime.split('m')[1].replace('s', ''))
        : parseInt(estimatedTime.replace('s', ''));
      
      const estimatedCompletionTime = new Date(now.getTime() + (timeInSeconds * 1000));
      
      // Create order details object
      const orderDetails = {
        user_id: user.id,
        location,
        fuel_type: fuelType,
        amount,
        company,
        price_per_liter: pricePerLiter,
        price: Number(estimatedPrice),
        estimated_completion_time: estimatedCompletionTime.toISOString(),
      };

      // Navigate to payment screen with the order details
      navigation.navigate('Payment', { orderDetails });

    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.locationRow}>
        <TextInput
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          placeholder="Enter location"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.gpsButton} onPress={getCurrentLocation}>
          <Ionicons name="navigate-circle-outline" size={35} color="#80f17e" />
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#80f17e" style={{ marginBottom: 10 }} />}

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(item)}>
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.fuelButton, fuelType === 'Gasoline' && styles.fuelButtonActive]}
          onPress={() => setFuelType('Gasoline')}>
          <Text style={styles.fuelButtonText}>Gasoline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fuelButton, fuelType === 'Diesel' && styles.fuelButtonActive]}
          onPress={() => setFuelType('Diesel')}>
          <Text style={styles.fuelButtonText}>Diesel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        {['FuelSave', 'V-Power 95', 'V-Power 100'].map((variant) => (
          <TouchableOpacity
            key={variant}
            style={[styles.chip, fuelVariant === variant && styles.chipActive]}
            onPress={() => setFuelVariant(variant)}>
            <Text style={styles.chipText}>{variant}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Select amount of fuel: {amount}L</Text>
      <Slider
        style={{ width: '100%', height: 40, marginBottom: 20 }}
        minimumValue={1}
        maximumValue={100}
        step={1}
        value={amount}
        minimumTrackTintColor="#80f17e"
        maximumTrackTintColor="#555"
        thumbTintColor="#80f17e"
        onValueChange={setAmount}
      />

      <View style={styles.buttonGroup}>
        {['Slovnaft', 'SHELL', 'OMV'].map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip2, company === c && styles.chipActive]}
            onPress={() => setCompany(c)}>
            <Text style={styles.chipText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.summary}>Cost per liter: {pricePerLiter}$</Text>
      <Text style={styles.summary}>Estimated price: {estimatedPrice}$</Text>
      
      <View style={styles.timeEstimateContainer}>
        <Ionicons name="time-outline" size={24} color="#80f17e" />
        <Text style={styles.timeEstimateText}>
          Estimated completion time: {estimatedTime}
        </Text>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleCreateOrder}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1d222a',
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    marginBottom: 20,
    flex: 1,
    marginRight: 0,
    marginLeft: 5,
  },
  suggestionsContainer: {
    backgroundColor: '#2a2f3a',
    borderRadius: 8,
    marginBottom: 20,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3f4a',
  },
  suggestionText: {
    color: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  fuelButton: {
    flex: 1,
    padding: 40,
    marginHorizontal: 5,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#80f17e',
    borderRadius: 10,
  },
  fuelButtonActive: {
    backgroundColor: '#80f17e',
  },
  fuelButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 17,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#80f17e',
    borderRadius: 20,
    marginHorizontal: 1,
  },
  chipActive: {
    backgroundColor: '#80f17e',
  },
  chipText: {
    color: '#fff',
    fontWeight: '500',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  sliderTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2f3a',
    paddingHorizontal: 10,
    borderRadius: 12,
    height: 40,
    marginBottom: 20,
  },
  sliderFill: {
    flex: 1,
    height: 6,
    backgroundColor: '#80f17e',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  dropIcon: {
    fontSize: 18,
    color: '#80f17e',
  },
  summary: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  nextButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#1d222a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chip2: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#80f17e',
    borderRadius: 20,
    marginHorizontal: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gpsButton: {
    borderRadius: 8,
    padding: 8,
    color: 'white',
    marginBottom: 20,
  },
  timeEstimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2f3a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  timeEstimateText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});