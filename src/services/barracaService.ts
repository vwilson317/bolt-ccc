import { supabase, handleSupabaseError } from '../lib/supabase'
import type { Barraca } from '../types'
import type { Database } from '../types/database'

type BarracaRow = Database['public']['Tables']['barracas']['Row']
type BarracaInsert = Database['public']['Tables']['barracas']['Insert']
type BarracaUpdate = Database['public']['Tables']['barracas']['Update']

// Transform database row to application type
const transformBarracaFromDB = (row: BarracaRow): Barraca => ({
  id: row.id,
  name: row.name,
  barracaNumber: row.barraca_number || undefined,
  location: row.location,
  coordinates: row.coordinates as { lat: number; lng: number },
  isOpen: row.is_open,
  typicalHours: row.typical_hours,
  description: row.description,
  images: row.images,
  menuPreview: row.menu_preview,
  contact: row.contact as any,
  amenities: row.amenities,
  weatherDependent: row.weather_dependent,
  ctaButtons: row.cta_buttons as any,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
})

// Transform application type to database insert
const transformBarracaToDB = (barraca: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>): BarracaInsert => ({
  name: barraca.name,
  barraca_number: barraca.barracaNumber || null,
  location: barraca.location,
  coordinates: barraca.coordinates,
  is_open: barraca.isOpen,
  typical_hours: barraca.typicalHours,
  description: barraca.description,
  images: barraca.images,
  menu_preview: barraca.menuPreview,
  contact: barraca.contact,
  amenities: barraca.amenities,
  weather_dependent: barraca.weatherDependent,
  cta_buttons: barraca.ctaButtons || []
})

export class BarracaService {
  // Get all barracas
  static async getAll(): Promise<Barraca[]> {
    try {
      const { data, error } = await supabase
        .from('barracas')
        .select('*')
        .order('name')

      if (error) {
        handleSupabaseError(error, 'getAll barracas')
      }

      return data?.map(transformBarracaFromDB) || []
    } catch (error) {
      console.error('Error fetching barracas:', error)
      throw error
    }
  }

  // Get barraca by ID
  static async getById(id: string): Promise<Barraca | null> {
    try {
      const { data, error } = await supabase
        .from('barracas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        handleSupabaseError(error, 'getById barraca')
      }

      return data ? transformBarracaFromDB(data) : null
    } catch (error) {
      console.error('Error fetching barraca by ID:', error)
      throw error
    }
  }

  // Search barracas with filters
  static async search(filters: {
    query?: string
    location?: string
    openOnly?: boolean
    limit?: number
  }): Promise<Barraca[]> {
    try {
      let query = supabase.from('barracas').select('*')

      // Apply filters
      if (filters.openOnly) {
        query = query.eq('is_open', true)
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      // For text search, use the database function for better performance
      if (filters.query) {
        const { data, error } = await supabase.rpc('search_barracas', {
          search_query: filters.query,
          location_filter: filters.location || null,
          open_only: filters.openOnly || false,
          limit_count: filters.limit || 20
        })

        if (error) {
          handleSupabaseError(error, 'search barracas')
        }

        // Get full barraca data for search results
        if (data && data.length > 0) {
          const ids = data.map(item => item.id)
          const { data: fullData, error: fullError } = await supabase
            .from('barracas')
            .select('*')
            .in('id', ids)

          if (fullError) {
            handleSupabaseError(fullError, 'get full barraca data')
          }

          // Sort by search rank
          const sortedData = fullData?.sort((a, b) => {
            const aRank = data.find(item => item.id === a.id)?.rank || 0
            const bRank = data.find(item => item.id === b.id)?.rank || 0
            return bRank - aRank
          })

          return sortedData?.map(transformBarracaFromDB) || []
        }

        return []
      }

      // Regular query without text search
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      query = query.order('name')

      const { data, error } = await query

      if (error) {
        handleSupabaseError(error, 'search barracas')
      }

      return data?.map(transformBarracaFromDB) || []
    } catch (error) {
      console.error('Error searching barracas:', error)
      throw error
    }
  }

  // Get nearby barracas using PostGIS
  static async getNearby(
    lat: number,
    lng: number,
    radiusKm: number = 5,
    limit: number = 20
  ): Promise<Barraca[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_barracas', {
        user_lat: lat,
        user_lng: lng,
        radius_km: radiusKm,
        limit_count: limit
      })

      if (error) {
        handleSupabaseError(error, 'get nearby barracas')
      }

      // Get full barraca data
      if (data && data.length > 0) {
        const ids = data.map(item => item.id)
        const { data: fullData, error: fullError } = await supabase
          .from('barracas')
          .select('*')
          .in('id', ids)

        if (fullError) {
          handleSupabaseError(fullError, 'get full nearby barraca data')
        }

        // Sort by distance
        const sortedData = fullData?.sort((a, b) => {
          const aDistance = data.find(item => item.id === a.id)?.distance_km || 0
          const bDistance = data.find(item => item.id === b.id)?.distance_km || 0
          return aDistance - bDistance
        })

        return sortedData?.map(transformBarracaFromDB) || []
      }

      return []
    } catch (error) {
      console.error('Error getting nearby barracas:', error)
      throw error
    }
  }

  // Create new barraca
  static async create(barraca: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>): Promise<Barraca> {
    try {
      const barracaData = transformBarracaToDB(barraca)

      const { data, error } = await supabase
        .from('barracas')
        .insert(barracaData)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'create barraca')
      }

      return transformBarracaFromDB(data)
    } catch (error) {
      console.error('Error creating barraca:', error)
      throw error
    }
  }

  // Update barraca
  static async update(id: string, updates: Partial<Barraca>): Promise<Barraca> {
    try {
      const updateData: BarracaUpdate = {}

      // Map updates to database fields
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.barracaNumber !== undefined) updateData.barraca_number = updates.barracaNumber || null
      if (updates.location !== undefined) updateData.location = updates.location
      if (updates.coordinates !== undefined) updateData.coordinates = updates.coordinates
      if (updates.isOpen !== undefined) updateData.is_open = updates.isOpen
      if (updates.typicalHours !== undefined) updateData.typical_hours = updates.typicalHours
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.images !== undefined) updateData.images = updates.images
      if (updates.menuPreview !== undefined) updateData.menu_preview = updates.menuPreview
      if (updates.contact !== undefined) updateData.contact = updates.contact
      if (updates.amenities !== undefined) updateData.amenities = updates.amenities
      if (updates.weatherDependent !== undefined) updateData.weather_dependent = updates.weatherDependent
      if (updates.ctaButtons !== undefined) updateData.cta_buttons = updates.ctaButtons

      const { data, error } = await supabase
        .from('barracas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'update barraca')
      }

      return transformBarracaFromDB(data)
    } catch (error) {
      console.error('Error updating barraca:', error)
      throw error
    }
  }

  // Delete barraca
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('barracas')
        .delete()
        .eq('id', id)

      if (error) {
        handleSupabaseError(error, 'delete barraca')
      }
    } catch (error) {
      console.error('Error deleting barraca:', error)
      throw error
    }
  }

  // Get barracas by location
  static async getByLocation(location: string): Promise<Barraca[]> {
    try {
      const { data, error } = await supabase
        .from('barracas')
        .select('*')
        .ilike('location', `%${location}%`)
        .order('name')

      if (error) {
        handleSupabaseError(error, 'get barracas by location')
      }

      return data?.map(transformBarracaFromDB) || []
    } catch (error) {
      console.error('Error getting barracas by location:', error)
      throw error
    }
  }

  // Get open barracas
  static async getOpen(): Promise<Barraca[]> {
    try {
      const { data, error } = await supabase
        .from('barracas')
        .select('*')
        .eq('is_open', true)
        .order('name')

      if (error) {
        handleSupabaseError(error, 'get open barracas')
      }

      return data?.map(transformBarracaFromDB) || []
    } catch (error) {
      console.error('Error getting open barracas:', error)
      throw error
    }
  }

  // Subscribe to real-time changes
  static subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('barracas-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'barracas'
        },
        (payload) => {
          console.log('Barraca change detected:', payload)
          callback(payload)
        }
      )
      .subscribe()
  }
}