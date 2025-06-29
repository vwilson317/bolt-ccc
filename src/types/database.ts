export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      barracas: {
        Row: {
          id: string
          name: string
          barraca_number: string | null
          location: string
          coordinates: Json
          is_open: boolean
          typical_hours: string
          description: string
          images: string[]
          menu_preview: string[]
          contact: Json
          amenities: string[]
          weather_dependent: boolean
          cta_buttons: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          barraca_number?: string | null
          location: string
          coordinates: Json
          is_open?: boolean
          typical_hours?: string
          description: string
          images?: string[]
          menu_preview?: string[]
          contact?: Json
          amenities?: string[]
          weather_dependent?: boolean
          cta_buttons?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          barraca_number?: string | null
          location?: string
          coordinates?: Json
          is_open?: boolean
          typical_hours?: string
          description?: string
          images?: string[]
          menu_preview?: string[]
          contact?: Json
          amenities?: string[]
          weather_dependent?: boolean
          cta_buttons?: Json
          created_at?: string
          updated_at?: string
        }
      }
      email_subscriptions: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          preferences: Json
          is_active: boolean
          unsubscribe_token: string
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          preferences?: Json
          is_active?: boolean
          unsubscribe_token?: string
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          preferences?: Json
          is_active?: boolean
          unsubscribe_token?: string
        }
      }
      stories: {
        Row: {
          id: string
          barraca_id: string
          media_url: string
          media_type: string
          caption: string | null
          duration: number | null
          created_at: string
          expires_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          barraca_id: string
          media_url: string
          media_type: string
          caption?: string | null
          duration?: number | null
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          barraca_id?: string
          media_url?: string
          media_type?: string
          caption?: string | null
          duration?: number | null
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
      }
      visitor_analytics: {
        Row: {
          id: string
          visitor_id: string
          first_visit: string
          last_visit: string
          visit_count: number
          user_agent: string | null
          referrer: string | null
          country: string | null
          city: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          visitor_id: string
          first_visit?: string
          last_visit?: string
          visit_count?: number
          user_agent?: string | null
          referrer?: string | null
          country?: string | null
          city?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          visitor_id?: string
          first_visit?: string
          last_visit?: string
          visit_count?: number
          user_agent?: string | null
          referrer?: string | null
          country?: string | null
          city?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      weather_cache: {
        Row: {
          id: string
          location: string
          temperature: number | null
          feels_like: number | null
          humidity: number | null
          wind_speed: number | null
          wind_direction: number | null
          description: string | null
          icon: string | null
          beach_conditions: string | null
          cached_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          location: string
          temperature?: number | null
          feels_like?: number | null
          humidity?: number | null
          wind_speed?: number | null
          wind_direction?: number | null
          description?: string | null
          icon?: string | null
          beach_conditions?: string | null
          cached_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          location?: string
          temperature?: number | null
          feels_like?: number | null
          humidity?: number | null
          wind_speed?: number | null
          wind_direction?: number | null
          description?: string | null
          icon?: string | null
          beach_conditions?: string | null
          cached_at?: string
          expires_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_nearby_barracas: {
        Args: {
          user_lat: number
          user_lng: number
          radius_km?: number
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          location: string
          is_open: boolean
          distance_km: number
        }[]
      }
      search_barracas: {
        Args: {
          search_query: string
          location_filter?: string
          open_only?: boolean
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          location: string
          is_open: boolean
          rank: number
        }[]
      }
      cleanup_expired_stories: {
        Args: {}
        Returns: void
      }
      cleanup_expired_weather: {
        Args: {}
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}