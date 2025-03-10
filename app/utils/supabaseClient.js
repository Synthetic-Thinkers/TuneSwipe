// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your own Supabase URL and API key
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_DOMAIN
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_SECRET
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
