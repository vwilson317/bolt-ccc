import { supabase, handleSupabaseError } from '../lib/supabase'
import type { WeatherData } from '../types'
import type { Database } from '../types/database'

type WeatherCacheRow = Database['public']['Tables']['weather_cache']['Row']
type WeatherCacheInsert = Database['public']['Tables']['weather_cache']['Insert']

// Transform database row to application type
const transformWeatherFromDB = (row: WeatherCacheRow): WeatherData => ({
  temperature: Number(row.temperature) || 0,
  feelsLike: Number(row.feels_like) || 0,
  humidity: row.humidity || 0,
  windSpeed: Number(row.wind_speed) || 0,
  windDirection: row.wind_direction || 0,
  description: row.description || '',
  icon: row.icon || '',
  beachConditions: (row.beach_conditions as any) || 'good'
})

export class WeatherService {
  private static readonly CACHE_DURATION_MINUTES = 15
  private static readonly DEFAULT_LOCATION = 'Rio de Janeiro'

  // Get current weather (with caching)
  static async getCurrentWeather(location: string = this.DEFAULT_LOCATION): Promise<WeatherData> {
    try {
      // First, try to get from cache
      const cachedWeather = await this.getCachedWeather(location)
      if (cachedWeather) {
        console.log(`🌤️ Using cached weather data for ${location}`)
        return cachedWeather
      }

      // If not in cache or expired, fetch from API
      console.log(`🌤️ Fetching fresh weather data for ${location}`)
      const freshWeather = await this.fetchWeatherFromAPI(location)
      
      // Cache the fresh data
      await this.cacheWeather(location, freshWeather)
      
      return freshWeather
    } catch (error) {
      console.error('Error getting current weather:', error)
      
      // Return fallback weather data
      return this.getFallbackWeather()
    }
  }

  // Get cached weather if available and not expired
  private static async getCachedWeather(location: string): Promise<WeatherData | null> {
    try {
      const { data, error } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('location', location)
        .gt('expires_at', new Date().toISOString())
        .order('cached_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No cached data found
        }
        handleSupabaseError(error, 'get cached weather')
      }

      return data ? transformWeatherFromDB(data) : null
    } catch (error) {
      console.error('Error getting cached weather:', error)
      return null
    }
  }

  // Fetch weather from external API (OpenWeatherMap)
  private static async fetchWeatherFromAPI(location: string): Promise<WeatherData> {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
    
    if (!API_KEY) {
      console.warn('OpenWeatherMap API key not configured, using mock data')
      return this.getMockWeatherData()
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: data.wind.deg || 0,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        beachConditions: this.calculateBeachConditions(data)
      }
    } catch (error) {
      console.error('Error fetching weather from API:', error)
      return this.getMockWeatherData()
    }
  }

  // Cache weather data
  private static async cacheWeather(location: string, weather: WeatherData): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + this.CACHE_DURATION_MINUTES)

      const cacheData: WeatherCacheInsert = {
        location,
        temperature: weather.temperature,
        feels_like: weather.feelsLike,
        humidity: weather.humidity,
        wind_speed: weather.windSpeed,
        wind_direction: weather.windDirection,
        description: weather.description,
        icon: weather.icon,
        beach_conditions: weather.beachConditions,
        expires_at: expiresAt.toISOString()
      }

      const { error } = await supabase
        .from('weather_cache')
        .insert(cacheData)

      if (error) {
        handleSupabaseError(error, 'cache weather data')
      }
    } catch (error) {
      console.error('Error caching weather data:', error)
      // Don't throw error for caching failures
    }
  }

  // Calculate beach conditions based on weather data
  private static calculateBeachConditions(weatherData: any): 'excellent' | 'good' | 'fair' | 'poor' {
    const temp = weatherData.main.temp
    const windSpeed = weatherData.wind.speed * 3.6 // Convert to km/h
    const humidity = weatherData.main.humidity
    const weatherCode = weatherData.weather[0].id

    // Poor conditions
    if (weatherCode >= 200 && weatherCode < 600) { // Thunderstorm, drizzle, rain
      return 'poor'
    }
    
    if (temp < 20 || temp > 35) { // Too cold or too hot
      return 'poor'
    }

    if (windSpeed > 25) { // Very windy
      return 'poor'
    }

    // Fair conditions
    if (weatherCode >= 700 && weatherCode < 800) { // Atmosphere (fog, mist, etc.)
      return 'fair'
    }

    if (temp < 22 || temp > 32) { // Slightly uncomfortable temperature
      return 'fair'
    }

    if (windSpeed > 20 || humidity > 85) { // Windy or very humid
      return 'fair'
    }

    // Good conditions
    if (weatherCode === 801 || weatherCode === 802) { // Few clouds or scattered clouds
      return 'good'
    }

    if (windSpeed > 15) { // Moderately windy
      return 'good'
    }

    // Excellent conditions
    if (weatherCode === 800) { // Clear sky
      return 'excellent'
    }

    if (temp >= 24 && temp <= 30 && windSpeed <= 15 && humidity <= 70) {
      return 'excellent'
    }

    return 'good' // Default
  }

  // Get mock weather data for development/fallback
  private static getMockWeatherData(): WeatherData {
    const variations = [
      {
        temperature: 28,
        feelsLike: 32,
        humidity: 65,
        windSpeed: 12,
        windDirection: 180,
        description: 'Partly Cloudy',
        icon: 'partly-cloudy',
        beachConditions: 'excellent' as const
      },
      {
        temperature: 25,
        feelsLike: 28,
        humidity: 70,
        windSpeed: 8,
        windDirection: 160,
        description: 'Sunny',
        icon: 'sunny',
        beachConditions: 'good' as const
      },
      {
        temperature: 30,
        feelsLike: 35,
        humidity: 60,
        windSpeed: 15,
        windDirection: 200,
        description: 'Clear',
        icon: 'clear',
        beachConditions: 'excellent' as const
      }
    ]

    return variations[Math.floor(Math.random() * variations.length)]
  }

  // Get fallback weather data for errors
  private static getFallbackWeather(): WeatherData {
    return {
      temperature: 26,
      feelsLike: 30,
      humidity: 68,
      windSpeed: 10,
      windDirection: 180,
      description: 'Pleasant',
      icon: 'partly-cloudy',
      beachConditions: 'good'
    }
  }

  // Clean up expired weather cache
  static async cleanupExpiredCache(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('weather_cache')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id')

      if (error) {
        handleSupabaseError(error, 'cleanup expired weather cache')
      }

      return data?.length || 0
    } catch (error) {
      console.error('Error cleaning up expired weather cache:', error)
      throw error
    }
  }

  // Get weather for multiple locations
  static async getWeatherForLocations(locations: string[]): Promise<Record<string, WeatherData>> {
    const weatherData: Record<string, WeatherData> = {}

    await Promise.all(
      locations.map(async (location) => {
        try {
          weatherData[location] = await this.getCurrentWeather(location)
        } catch (error) {
          console.error(`Error getting weather for ${location}:`, error)
          weatherData[location] = this.getFallbackWeather()
        }
      })
    )

    return weatherData
  }

  // Update weather-dependent barracas based on current conditions
  static async updateWeatherDependentBarracas(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('update_weather_dependent_barracas')
      
      if (error) {
        handleSupabaseError(error, 'update weather-dependent barracas')
      }
      
      return data || 0
    } catch (error) {
      console.error('Error updating weather-dependent barracas:', error)
      return 0
    }
  }
}