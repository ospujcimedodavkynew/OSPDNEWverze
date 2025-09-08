import { createClient } from '@supabase/supabase-js'
import type DB from './types/database.types'

// Get URL and Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in environment variables');
}

// Create and export the client
export const supabase = createClient<DB>(supabaseUrl, supabaseAnonKey)
