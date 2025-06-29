import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Environment configuration
const getEnvironmentConfig = () => {
  const env = import.meta.env.VITE_APP_ENV || 'development'
  
  const configs = {
    development: {
      url: import.meta.env.VITE_SUPABASE_URL_DEV || import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_DEV || import.meta.env.VITE_SUPABASE_ANON_KEY,
      schema: 'public' // Always use public for client, we'll specify schema in queries
    },
    qa: {
      url: import.meta.env.VITE_SUPABASE_URL_QA || import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_QA || import.meta.env.VITE_SUPABASE_ANON_KEY,
      schema: 'public'
    },
    uat: {
      url: import.meta.env.VITE_SUPABASE_URL_UAT || import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_UAT || import.meta.env.VITE_SUPABASE_ANON_KEY,
      schema: 'public'
    },
    production: {
      url: import.meta.env.VITE_SUPABASE_URL_PROD || import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_PROD || import.meta.env.VITE_SUPABASE_ANON_KEY,
      schema: 'public'
    }
  }
  
  return configs[env as keyof typeof configs] || configs.development
}

const config = getEnvironmentConfig()

if (!config.url || !config.anonKey) {
  throw new Error(`Missing Supabase environment variables for ${import.meta.env.VITE_APP_ENV || 'development'} environment. Please check your .env file.`)
}

export const supabase = createClient<Database>(config.url, config.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  }
  // Removed db.schema configuration - Supabase only accepts 'public' or 'graphql_public'
})

// Environment info for debugging
export const environmentInfo = {
  environment: import.meta.env.VITE_APP_ENV || 'development',
  schema: 'public', // Always use public schema for client
  url: config.url,
  isDevelopment: (import.meta.env.VITE_APP_ENV || 'development') === 'development',
  isQA: (import.meta.env.VITE_APP_ENV || 'development') === 'qa',
  isUAT: (import.meta.env.VITE_APP_ENV || 'development') === 'uat',
  isProduction: (import.meta.env.VITE_APP_ENV || 'development') === 'production'
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context} (${environmentInfo.environment}):`, error)
  
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
      console.error(`Supabase connection check failed (${environmentInfo.environment}):`, error)
      return false
    }
    
    console.log(`✅ Connected to Supabase ${environmentInfo.environment} environment (${environmentInfo.schema} schema)`)
    return true
  } catch (error) {
    console.error(`Supabase connection check failed (${environmentInfo.environment}):`, error)
    return false
  }
}

// Real-time subscription helpers
export const subscribeToBarracas = (callback: (payload: any) => void) => {
  return supabase
    .channel(`barracas-changes-${environmentInfo.schema}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: environmentInfo.schema,
        table: 'barracas'
      },
      callback
    )
    .subscribe()
}

export const subscribeToStories = (callback: (payload: any) => void) => {
  return supabase
    .channel(`stories-changes-${environmentInfo.schema}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: environmentInfo.schema,
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

// Environment-specific logging
export const logEnvironmentInfo = () => {
  console.log('🌍 Environment Configuration:', {
    environment: environmentInfo.environment,
    schema: environmentInfo.schema,
    isDevelopment: environmentInfo.isDevelopment,
    isProduction: environmentInfo.isProduction
  })
}