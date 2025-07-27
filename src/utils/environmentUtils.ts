import { environmentInfo } from '../lib/supabase'

export interface EnvironmentConfig {
  name: string
  schema: string
  isDevelopment: boolean
  isQA: boolean
  isUAT: boolean
  isProduction: boolean
  allowedFeatures: {
    adminAccess: boolean
    debugMode: boolean
    testData: boolean
    analytics: boolean
    errorReporting: boolean
  }
  dataRetention: {
    stories: number // days
    weatherCache: number // minutes
    visitorData: number // days
  }
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = environmentInfo.environment

  const configs: Record<string, EnvironmentConfig> = {
    development: {
      name: 'Development',
      schema: 'dev',
      isDevelopment: true,
      isQA: false,
      isUAT: false,
      isProduction: false,
      allowedFeatures: {
        adminAccess: true,
        debugMode: true,
        testData: true,
        analytics: false,
        errorReporting: false
      },
      dataRetention: {
        stories: 7, // Keep stories for 7 days in dev
        weatherCache: 5, // 5 minute cache in dev
        visitorData: 30 // Keep visitor data for 30 days
      }
    },
    qa: {
      name: 'Quality Assurance',
      schema: 'qa',
      isDevelopment: false,
      isQA: true,
      isUAT: false,
      isProduction: false,
      allowedFeatures: {
        adminAccess: true,
        debugMode: true,
        testData: true,
        analytics: true,
        errorReporting: true
      },
      dataRetention: {
        stories: 3, // Shorter retention for QA
        weatherCache: 10, // 10 minute cache
        visitorData: 14 // 2 weeks visitor data
      }
    },
    uat: {
      name: 'User Acceptance Testing',
      schema: 'uat',
      isDevelopment: false,
      isQA: false,
      isUAT: true,
      isProduction: false,
      allowedFeatures: {
        adminAccess: false, // Limited admin access in UAT
        debugMode: false,
        testData: false, // No test data in UAT
        analytics: true,
        errorReporting: true
      },
      dataRetention: {
        stories: 1, // 1 day retention for UAT
        weatherCache: 15, // 15 minute cache
        visitorData: 7 // 1 week visitor data
      }
    },
    production: {
      name: 'Production',
      schema: 'prod',
      isDevelopment: false,
      isQA: false,
      isUAT: false,
      isProduction: true,
      allowedFeatures: {
        adminAccess: false, // No admin access in production UI
        debugMode: false,
        testData: false,
        analytics: true,
        errorReporting: true
      },
      dataRetention: {
        stories: 1, // 24 hours for stories
        weatherCache: 15, // 15 minute cache
        visitorData: 365 // 1 year visitor data retention
      }
    }
  }

  return configs[env] || configs.development
}

export const isFeatureEnabled = (feature: keyof EnvironmentConfig['allowedFeatures']): boolean => {
  const config = getEnvironmentConfig()
  return config.allowedFeatures[feature]
}

export const getDataRetention = (dataType: keyof EnvironmentConfig['dataRetention']): number => {
  const config = getEnvironmentConfig()
  return config.dataRetention[dataType]
}

export const getEnvironmentBadge = (): { text: string; color: string; visible: boolean } => {
  const config = getEnvironmentConfig()
  
  if (config.isProduction) {
    return { text: '', color: '', visible: false }
  }
  
  const badges = {
    development: { text: 'DEV', color: 'bg-blue-500', visible: true },
    qa: { text: 'QA', color: 'bg-yellow-500', visible: true },
    uat: { text: 'UAT', color: 'bg-purple-500', visible: true }
  }
  
  return badges[config.schema as keyof typeof badges] || badges.development
}

export const logEnvironmentInfo = () => {
  const config = getEnvironmentConfig()
  
  console.group('🌍 Environment Configuration')
  console.log('Environment:', config.name)
  console.log('Schema:', config.schema)
  console.log('Features:', config.allowedFeatures)
  console.log('Data Retention:', config.dataRetention)
  console.groupEnd()
}

// Environment-specific error handling
export const handleEnvironmentError = (error: Error, context: string) => {
  const config = getEnvironmentConfig()
  
  if (config.allowedFeatures.errorReporting) {
    // Send to error reporting service (Sentry, etc.)
    console.error(`[${config.name}] Error in ${context}:`, error)
  }
  
  if (config.allowedFeatures.debugMode) {
    // Show detailed error info in development
    console.group(`🚨 Debug Error - ${context}`)
    console.error('Error:', error)
    console.error('Stack:', error.stack)
    console.error('Environment:', config.name)
    console.groupEnd()
  }
}

// Environment-specific data validation
export const validateEnvironmentData = (data: any, type: string): boolean => {
  const config = getEnvironmentConfig()
  
  // In production, be more strict about data validation
  if (config.isProduction) {
    // Add production-specific validation rules
    if (type === 'barraca' && !data.id) {
      throw new Error('Barraca ID is required in production')
    }
  }
  
  // In development, allow more flexible data
  if (config.isDevelopment) {
    // Log validation warnings instead of throwing errors
    if (type === 'barraca' && !data.id) {
      console.warn('⚠️ Barraca missing ID in development')
    }
  }
  
  return true
}

/**
 * Calculates the effective open status of a barraca considering weather override, partnered status, and special admin override
 * @param barraca - The barraca object
 * @param weatherOverride - Whether weather override is active
 * @returns The effective open status (true if open, false if closed, null if undetermined for non-partnered)
 */
export const getEffectiveOpenStatus = (barraca: { 
  isOpen: boolean; 
  partnered: boolean; 
  specialAdminOverride?: boolean; 
  specialAdminOverrideExpires?: Date | null;
}, weatherOverride: boolean): boolean | null => {
  // Check if special admin override is active and not expired
  if (barraca.specialAdminOverride && barraca.specialAdminOverrideExpires) {
    const now = new Date();
    if (now < barraca.specialAdminOverrideExpires) {
      return true; // Special admin override takes precedence
    }
  }
  
  // Non-partnered barracas have undetermined open status
  if (!barraca.partnered) {
    return null;
  }
  
  return weatherOverride ? false : barraca.isOpen;
};