import { supabase, handleSupabaseError } from '../lib/supabase'

export interface WeatherOverride {
  is_active: boolean
  expires_at: Date | null
}

export class WeatherOverrideService {
  // Get current weather override status
  static async getStatus(): Promise<WeatherOverride> {
    try {
      const { data, error } = await supabase.rpc('get_weather_override')

      if (error) {
        handleSupabaseError(error, 'get weather override status')
      }

      if (data && data.length > 0) {
        return {
          is_active: data[0].is_active,
          expires_at: data[0].expires_at ? new Date(data[0].expires_at) : null
        }
      }

      // Default to inactive if no override exists
      return {
        is_active: false,
        expires_at: null
      }
    } catch (error) {
      console.error('Error getting weather override status:', error)
      throw error
    }
  }

  // Set weather override status
  static async setStatus(active: boolean, expiresAt?: Date): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('set_weather_override', {
        active,
        expiry: expiresAt?.toISOString() || null
      })

      if (error) {
        handleSupabaseError(error, 'set weather override status')
      }

      return data || false
    } catch (error) {
      console.error('Error setting weather override status:', error)
      throw error
    }
  }

  // Clear expired overrides
  static async clearExpired(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('clear_expired_override')

      if (error) {
        handleSupabaseError(error, 'clear expired weather override')
      }

      return data || 0
    } catch (error) {
      console.error('Error clearing expired weather override:', error)
      throw error
    }
  }

  // Subscribe to real-time changes
  static subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('weather-override-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weather_override'
        },
        (payload) => {
          console.log('Weather override change detected:', payload)
          callback(payload)
        }
      )
      .subscribe()
  }
} 