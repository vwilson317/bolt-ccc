import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error)
  
  if (error?.code === 'PGRST116') {
    throw new Error('No data found')
  }
  
  if (error?.code === 'PGRST301') {
    throw new Error('Database connection error')
  }
  
  throw new Error(error?.message || 'An unexpected error occurred')
}

// Connection health check
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('barracas')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection check failed:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Supabase connection check failed:', error)
    return false
  }
}

// Real-time subscription helpers
export const subscribeToBarracas = (callback: (payload: any) => void) => {
  return supabase
    .channel('barracas-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'barracas'
      },
      callback
    )
    .subscribe()
}

export const subscribeToStories = (callback: (payload: any) => void) => {
  return supabase
    .channel('stories-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'stories'
      },
      callback
    )
    .subscribe()
}

// Cleanup function for subscriptions
export const unsubscribeFromChannel = (subscription: any) => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
}