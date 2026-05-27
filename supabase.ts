import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zlzrjmynbqpeoocvugcz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsenJqbXluYnFwZW9vY3Z1Z2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTkyODcsImV4cCI6MjA5NDM3NTI4N30.vVQZ-KVc4UL6fCdFMS7btyez2mMOGcipwZqrS4tm9dI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});