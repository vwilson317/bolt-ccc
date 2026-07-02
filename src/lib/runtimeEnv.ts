// Pure VITE_APP_ENV detection, split out from lib/supabase.ts so that code
// which only needs to know "which environment am I in" (e.g. Sentry setup)
// doesn't pull the Supabase SDK into its bundle just for this.
export type RuntimeEnv = 'dev' | 'qa' | 'uat' | 'prod'

export const normalizeRuntimeEnv = (rawEnv: string | undefined): RuntimeEnv => {
  const value = (rawEnv || '').trim().toLowerCase()

  // Handle common aliases from hosting providers / local env files
  if (value === 'development') return 'dev'
  if (value === 'production') return 'prod'

  // Known valid values
  if (value === 'dev' || value === 'qa' || value === 'uat' || value === 'prod') {
    return value
  }

  // Guard against placeholder/malformed values such as "dev|qa|uat|prod"
  if (value.includes('|') || value.includes(',')) {
    const fallback = import.meta.env.PROD ? 'prod' : 'dev'
    console.warn(`⚠️ Invalid VITE_APP_ENV value "${rawEnv}". Falling back to "${fallback}".`)
    return fallback
  }

  // Production builds should prefer prod when env is missing/unknown
  if (import.meta.env.PROD) {
    console.warn(`⚠️ Unknown VITE_APP_ENV value "${rawEnv}". Falling back to "prod" for production build.`)
    return 'prod'
  }

  console.warn(`⚠️ Unknown VITE_APP_ENV value "${rawEnv}". Falling back to "dev".`)
  return 'dev'
}

export const runtimeEnv = normalizeRuntimeEnv(import.meta.env.VITE_APP_ENV)
