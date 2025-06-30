import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
  if (!url || url.includes('your_') || url === 'your_default_supabase_project_url') {
    return false
  }
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Helper function to validate API key
const isValidApiKey = (key: string): boolean => {
  return !(!key || key.includes('your_') || key === 'your_default_supabase_anon_key')
}

// Environment configuration
const getEnvironmentConfig = () => {
  const env = import.meta.env.VITE_APP_ENV || 'development'
  
  const configs = {
    development: {
      url: import.meta.env.VITE_SUPABASE_URL_DEV || import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_DEV || import.meta.env.VITE_SUPABASE_ANON_KEY,
      schema: 'public'
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
const currentEnv = import.meta.env.VITE_APP_ENV || 'development'

// Validate configuration
if (!config.url || !isValidUrl(config.url)) {
  console.error(`❌ Invalid or missing Supabase URL for ${currentEnv} environment`)
  console.error('Please update your .env file with a valid Supabase project URL')
  console.error('Example: VITE_SUPABASE_URL=https://your-project.supabase.co')
  throw new Error(`Invalid Supabase URL for ${currentEnv} environment. Please check your .env file and ensure you have a valid Supabase project URL.`)
}

if (!config.anonKey || !isValidApiKey(config.anonKey)) {
  console.error(`❌ Invalid or missing Supabase anonymous key for ${currentEnv} environment`)
  console.error('Please update your .env file with a valid Supabase anonymous key')
  throw new Error(`Invalid Supabase anonymous key for ${currentEnv} environment. Please check your .env file and ensure you have a valid Supabase anonymous key.`)
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
})

// Environment info for debugging
export const environmentInfo = {
  environment: currentEnv,
  schema: 'public',
  url: config.url,
  isDevelopment: currentEnv === 'development',
  isQA: currentEnv === 'qa',
  isUAT: currentEnv === 'uat',
  isProduction: currentEnv === 'production'
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context} (${environmentInfo.environment}):`, error)
  
  if (error?.code === 'PGRST116') {
    // No data found - this is often expected, so just log and return
    console.log(`No data found in ${context}`)
    return
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