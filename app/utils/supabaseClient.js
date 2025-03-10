// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your own Supabase URL and API key
const SUPABASE_URL = process.env.EXPO_PUBLIC_URL
const SUPABASE_KEY = process.env.EXPO_PUBLIC_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
