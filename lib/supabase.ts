import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://euehwtialzjngfujwxqu.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZWh3dGlhbHpqbmdmdWp3eHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjI1MTUsImV4cCI6MjA1NzE5ODUxNX0.Cmosn3Gsy452jmPPtEND08fUC7_Pr4l9xYxxRHHrR2g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
