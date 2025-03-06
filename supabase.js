
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ierqhxlamotfahrwcsdz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcnFoeGxhbW90ZmFocndjc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNDE4MzAsImV4cCI6MjA1NjcxNzgzMH0.ZjAIYwXqsDHV6r4HJoxa2Z3q4CXZKkL3qf5DZgmpeuY'
export const supabase = createClient(supabaseUrl, supabaseKey)