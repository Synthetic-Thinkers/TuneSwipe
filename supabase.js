
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_DOMAIN
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SECRET
export const supabase = createClient(supabaseUrl, supabaseKey)