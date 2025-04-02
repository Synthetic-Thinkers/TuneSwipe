// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Replace these with your own Supabase URL and API key
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
