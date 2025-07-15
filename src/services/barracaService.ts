import { supabase, handleSupabaseError } from '../lib/supabase'
import type { Barraca } from '../types'
import type { Database } from '../types/database'


type BarracaRow = Database['public']['Tables']['barracas']['Row']
type BarracaInsert = Database['public']['Tables']['barracas']['Insert']
type BarracaUpdate = Database['public']['Tables']['barracas']['Update']
type Json = Database['public']['Tables']['barracas']['Row']['cta_buttons']

// Transform database row to application type
const transformBarracaFromDB = (row: BarracaRow, isOpen: boolean = false): Barraca => ({
  id: row.id,
  name: row.name,
  barracaNumber: row.barraca_number || undefined,
  location: row.location,
  coordinates: row.coordinates as { lat: number; lng: number },
  isOpen,
  typicalHours: row.typical_hours,
  description: row.description,
  photos: row.photos,
  menuPreview: row.menu_preview,
  contact: row.contact as any,
  amenities: row.amenities,
  weatherDependent: row.weather_dependent,
  partnered: row.partnered,
  weekendHoursEnabled: row.weekend_hours_enabled || false,
  weekendHours: row.weekend_hours_schedule as any,
  manualStatus: (row.manual_status as 'open' | 'closed' | 'undefined') || 'undefined',
  specialAdminOverride: row.special_admin_override || false,
  specialAdminOverrideExpires: row.special_admin_override_expires ? new Date(row.special_admin_override_expires) : null,
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
  typical_hours: barraca.typicalHours,
  description: barraca.description,
  photos: barraca.photos,
  menu_preview: barraca.menuPreview,
  contact: barraca.contact,
  amenities: barraca.amenities,
  weather_dependent: barraca.weatherDependent,
  partnered: barraca.partnered,
  weekend_hours_enabled: barraca.weekendHoursEnabled,
  special_admin_override: barraca.specialAdminOverride,
  special_admin_override_expires: barraca.specialAdminOverrideExpires?.toISOString() || null,
  cta_buttons: (barraca.ctaButtons as unknown as Json) || []
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

      // Get open status for each barraca
      const barracasWithOpenStatus = []
      for (const row of data || []) {
        const isOpen = await BarracaService.getOpenStatus(row.id)
        barracasWithOpenStatus.push(transformBarracaFromDB(row, isOpen))
      }

      // Sort by partnered status first, then by name
      barracasWithOpenStatus.sort((a, b) => {
        if (a.partnered !== b.partnered) {
          return a.partnered ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return barracasWithOpenStatus
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

      if (data) {
        const isOpen = await BarracaService.getOpenStatus(data.id)
        return transformBarracaFromDB(data, isOpen)
      }
      return null
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

      // Apply filters - openOnly is now handled by the database function
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
          const ids = data.map((item: { id: string }) => item.id)
          const { data: fullData, error: fullError } = await supabase
            .from('barracas')
            .select('*')
            .in('id', ids)

          if (fullError) {
            handleSupabaseError(fullError, 'get full barraca data')
          }

          // Sort by search rank
        const sortedData = fullData?.sort((a: BarracaRow, b: BarracaRow) => {
          const aRank = data.find((item: { id: string; rank: number }) => item.id === a.id)?.rank || 0
          const bRank = data.find((item: { id: string; rank: number }) => item.id === b.id)?.rank || 0
          return bRank - aRank
        })

          // Get open status for each barraca
          const barracasWithOpenStatus = []
          for (const row of sortedData || []) {
            const isOpen = await BarracaService.getOpenStatus(row.id)
            barracasWithOpenStatus.push(transformBarracaFromDB(row, isOpen))
          }
          
          // Sort by partnered status first, then by search rank
          barracasWithOpenStatus.sort((a, b) => {
            if (a.partnered !== b.partnered) {
              return a.partnered ? -1 : 1;
            }
            // Within each partnered group, maintain search rank order
            const aRank = data.find((item: { id: string; rank: number }) => item.id === a.id)?.rank || 0;
            const bRank = data.find((item: { id: string; rank: number }) => item.id === b.id)?.rank || 0;
            return bRank - aRank;
          });
          
          return barracasWithOpenStatus
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

      // Get open status for each barraca
      const barracasWithOpenStatus = []
      for (const row of data || []) {
        const isOpen = await BarracaService.getOpenStatus(row.id)
        barracasWithOpenStatus.push(transformBarracaFromDB(row, isOpen))
      }
      return barracasWithOpenStatus
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
        const ids = data.map((item: { id: string }) => item.id)
        const { data: fullData, error: fullError } = await supabase
          .from('barracas')
          .select('*')
          .in('id', ids)

        if (fullError) {
          handleSupabaseError(fullError, 'get full nearby barraca data')
        }

        // Sort by distance
        const sortedData = fullData?.sort((a: BarracaRow, b: BarracaRow) => {
          const aDistance = data.find((item: { id: string; distance_km: number }) => item.id === a.id)?.distance_km || 0
          const bDistance = data.find((item: { id: string; distance_km: number }) => item.id === b.id)?.distance_km || 0
          return aDistance - bDistance
        })

        // Get open status for each barraca
        const barracasWithOpenStatus = []
        for (const row of sortedData || []) {
          const isOpen = await BarracaService.getOpenStatus(row.id)
          barracasWithOpenStatus.push(transformBarracaFromDB(row, isOpen))
        }
        
        // Sort by partnered status first, then by distance
        barracasWithOpenStatus.sort((a, b) => {
          if (a.partnered !== b.partnered) {
            return a.partnered ? -1 : 1;
          }
          // Within each partnered group, maintain distance order
          const aDistance = data.find((item: { id: string; distance_km: number }) => item.id === a.id)?.distance_km || 0;
          const bDistance = data.find((item: { id: string; distance_km: number }) => item.id === b.id)?.distance_km || 0;
          return aDistance - bDistance;
        });
        
        return barracasWithOpenStatus
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

      const isOpen = await BarracaService.getOpenStatus(data.id)
      return transformBarracaFromDB(data, isOpen)
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
      if (updates.typicalHours !== undefined) updateData.typical_hours = updates.typicalHours
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.photos !== undefined) updateData.photos = updates.photos
      if (updates.menuPreview !== undefined) updateData.menu_preview = updates.menuPreview
      if (updates.contact !== undefined) updateData.contact = updates.contact
      if (updates.amenities !== undefined) updateData.amenities = updates.amenities
      if (updates.weatherDependent !== undefined) updateData.weather_dependent = updates.weatherDependent
      if (updates.partnered !== undefined) updateData.partnered = updates.partnered
      if (updates.ctaButtons !== undefined) updateData.cta_buttons = updates.ctaButtons as unknown as Json

      const { data, error } = await supabase
        .from('barracas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'update barraca')
      }

      const isOpen = await BarracaService.getOpenStatus(data.id)
      return transformBarracaFromDB(data, isOpen)
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

      // Get open status for each barraca
      const barracasWithOpenStatus = []
      for (const row of data || []) {
        const isOpen = await BarracaService.getOpenStatus(row.id)
        barracasWithOpenStatus.push(transformBarracaFromDB(row, isOpen))
      }
      
      // Sort by partnered status first, then by name
      barracasWithOpenStatus.sort((a, b) => {
        if (a.partnered !== b.partnered) {
          return a.partnered ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      
      return barracasWithOpenStatus
    } catch (error) {
      console.error('Error getting barracas by location:', error)
      throw error
    }
  }

  // Get open barracas - now uses database function to determine open status
  static async getOpen(): Promise<Barraca[]> {
    try {
      // Get all barracas and filter by open status using the database function
      const { data, error } = await supabase
        .from('barracas')
        .select('*')
        .order('name')

      if (error) {
        handleSupabaseError(error, 'get all barracas for open filter')
      }

      // Filter to only open barracas using the database function
      const openBarracas = []
      for (const barraca of data || []) {
        const { data: isOpenData, error: isOpenError } = await supabase.rpc('is_barraca_open_now', {
          barraca_id_param: barraca.id
        })
        
        if (isOpenError) {
          console.error('Error checking if barraca is open:', isOpenError)
          continue
        }
        
        if (isOpenData) {
          openBarracas.push(barraca)
        }
      }

      // Get open status for each barraca
      const barracasWithOpenStatus = []
      for (const row of openBarracas) {
        const isOpen = await BarracaService.getOpenStatus(row.id)
        barracasWithOpenStatus.push(transformBarracaFromDB(row, isOpen))
      }
      
      // Sort by partnered status first, then by name
      barracasWithOpenStatus.sort((a, b) => {
        if (a.partnered !== b.partnered) {
          return a.partnered ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      
      return barracasWithOpenStatus
    } catch (error) {
      console.error('Error getting open barracas:', error)
      throw error
    }
  }

  // Get open status for a barraca using the database function
  static async getOpenStatus(barracaId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_barraca_open_now', {
        barraca_id_param: barracaId
      })

      if (error) {
        handleSupabaseError(error, 'get open status')
      }

      return data || false
    } catch (error) {
      console.error('Error getting open status:', error)
      throw error
    }
  }

  // Subscribe to real-time changes
  static subscribeToChanges(callback: (payload: unknown) => void) {
    return supabase
      .channel('barracas-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'barracas'
        },
        (payload: unknown) => {
          console.log('Barraca change detected:', payload)
          callback(payload)
        }
      )
      .subscribe()
  }

  // Weekend Hours Management
  static async setWeekendHours(
    barracaId: string,
    fridayOpen?: string,
    fridayClose?: string,
    saturdayOpen?: string,
    saturdayClose?: string,
    sundayOpen?: string,
    sundayClose?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_weekend_hours', {
        barraca_id_param: barracaId,
        friday_open: fridayOpen,
        friday_close: fridayClose,
        saturday_open: saturdayOpen,
        saturday_close: saturdayClose,
        sunday_open: sundayOpen,
        sunday_close: sundayClose
      })

      if (error) {
        handleSupabaseError(error, 'set weekend hours')
      }
    } catch (error) {
      console.error('Error setting weekend hours:', error)
      throw error
    }
  }

  static async disableWeekendHours(barracaId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('disable_weekend_hours', {
        barraca_id_param: barracaId
      })

      if (error) {
        handleSupabaseError(error, 'disable weekend hours')
      }
    } catch (error) {
      console.error('Error disabling weekend hours:', error)
      throw error
    }
  }

  // Special Admin Functions
  static async specialAdminOpenBarraca(barracaId: string, durationHours: number = 24): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('special_admin_open_barraca', {
        barraca_id_param: barracaId,
        duration_hours: durationHours
      })

      if (error) {
        handleSupabaseError(error, 'special admin open barraca')
      }

      return data || false
    } catch (error) {
      console.error('Error opening barraca with special admin:', error)
      throw error
    }
  }

  static async specialAdminCloseBarraca(barracaId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('special_admin_close_barraca', {
        barraca_id_param: barracaId
      })

      if (error) {
        handleSupabaseError(error, 'special admin close barraca')
      }

      return data || false
    } catch (error) {
      console.error('Error closing barraca with special admin:', error)
      throw error
    }
  }

  static async getSpecialAdminOverrides(): Promise<Array<{
    barracaId: string;
    barracaName: string;
    overrideExpires: Date;
    hoursRemaining: number;
  }>> {
    try {
      const { data, error } = await supabase.rpc('get_special_admin_overrides')

      if (error) {
        handleSupabaseError(error, 'get special admin overrides')
      }

      return (data || []).map((item: any) => ({
        barracaId: item.barraca_id,
        barracaName: item.barraca_name,
        overrideExpires: new Date(item.override_expires),
        hoursRemaining: item.hours_remaining
      }))
    } catch (error) {
      console.error('Error getting special admin overrides:', error)
      throw error
    }
  }

  // Get barracas with manual status (for super admin)
  static async getBarracasWithManualStatus(): Promise<Array<{
    barracaId: string;
    barracaName: string;
    location: string;
    partnered: boolean;
    manualStatus: string;
    lastUpdated: Date;
  }>> {
    try {
      const { data, error } = await supabase.rpc('get_barracas_with_manual_status');

      if (error) {
        handleSupabaseError(error, 'get barracas with manual status');
      }

      return (data || []).map((row: any) => ({
        barracaId: row.barraca_id,
        barracaName: row.barraca_name,
        location: row.location,
        partnered: row.partnered,
        manualStatus: row.manual_status,
        lastUpdated: new Date(row.last_updated)
      }));
    } catch (error) {
      console.error('Error fetching barracas with manual status:', error);
      throw error;
    }
  }

  // Set manual status for non-partnered barraca (super admin only)
  static async setManualStatus(barracaId: string, status: 'open' | 'closed' | 'undefined'): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('set_manual_barraca_status', {
        barraca_id_param: barracaId,
        status_param: status
      });

      if (error) {
        handleSupabaseError(error, 'set manual barraca status');
      }

      return data || false;
    } catch (error) {
      console.error('Error setting manual status:', error);
      throw error;
    }
  }
}