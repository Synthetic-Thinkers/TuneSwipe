import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_DOMAIN || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SECRET || '';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
