import { supabase, handleSupabaseError } from '../lib/supabase'
import type { Story, StoryMedia } from '../types'
import type { Database } from '../types/database'

type StoryRow = Database['public']['Tables']['stories']['Row']
type StoryInsert = Database['public']['Tables']['stories']['Insert']

// Transform database row to application type
const transformStoryFromDB = (row: StoryRow, barracaName: string): Story => ({
  id: row.id,
  barracaId: row.barraca_id,
  barracaName,
  media: [{
    id: row.id,
    type: row.media_type as 'image' | 'video',
    url: row.media_url,
    caption: row.caption || undefined,
    duration: row.duration || undefined,
    timestamp: new Date(row.created_at)
  }],
  isViewed: false, // This will be managed client-side
  createdAt: new Date(row.created_at),
  expiresAt: new Date(row.expires_at)
})

export class StoryService {
  // Get all active stories
  static async getActiveStories(): Promise<Story[]> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          barracas (
            name
          )
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'get active stories')
      }

      // Group stories by barraca
      const storiesByBarraca = new Map<string, Story>()

      data?.forEach((row: any) => {
        const barracaName = row.barracas?.name || 'Unknown Barraca'
        const story = transformStoryFromDB(row, barracaName)

        if (storiesByBarraca.has(row.barraca_id)) {
          // Add media to existing story
          const existingStory = storiesByBarraca.get(row.barraca_id)!
          existingStory.media.push(story.media[0])
        } else {
          // Create new story
          storiesByBarraca.set(row.barraca_id, story)
        }
      })

      return Array.from(storiesByBarraca.values())
    } catch (error) {
      console.error('Error getting active stories:', error)
      throw error
    }
  }

  // Get stories for a specific barraca
  static async getStoriesForBarraca(barracaId: string): Promise<Story[]> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          barracas (
            name
          )
        `)
        .eq('barraca_id', barracaId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'get stories for barraca')
      }

      if (!data || data.length === 0) {
        return []
      }

      const barracaName = data[0].barracas?.name || 'Unknown Barraca'
      const media: StoryMedia[] = data.map(row => ({
        id: row.id,
        type: row.media_type as 'image' | 'video',
        url: row.media_url,
        caption: row.caption || undefined,
        duration: row.duration || undefined,
        timestamp: new Date(row.created_at)
      }))

      return [{
        id: `story-${barracaId}`,
        barracaId,
        barracaName,
        media,
        isViewed: false,
        createdAt: new Date(Math.min(...data.map(row => new Date(row.created_at).getTime()))),
        expiresAt: new Date(Math.max(...data.map(row => new Date(row.expires_at).getTime())))
      }]
    } catch (error) {
      console.error('Error getting stories for barraca:', error)
      throw error
    }
  }

  // Create new story
  static async createStory(
    barracaId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video',
    caption?: string,
    duration?: number
  ): Promise<void> {
    try {
      const storyData: StoryInsert = {
        barraca_id: barracaId,
        media_url: mediaUrl,
        media_type: mediaType,
        caption,
        duration,
        is_active: true
      }

      const { error } = await supabase
        .from('stories')
        .insert(storyData)

      if (error) {
        handleSupabaseError(error, 'create story')
      }
    } catch (error) {
      console.error('Error creating story:', error)
      throw error
    }
  }

  // Delete story
  static async deleteStory(storyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)

      if (error) {
        handleSupabaseError(error, 'delete story')
      }
    } catch (error) {
      console.error('Error deleting story:', error)
      throw error
    }
  }

  // Deactivate story
  static async deactivateStory(storyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_active: false })
        .eq('id', storyId)

      if (error) {
        handleSupabaseError(error, 'deactivate story')
      }
    } catch (error) {
      console.error('Error deactivating story:', error)
      throw error
    }
  }

  // Clean up expired stories (called by cron job or manually)
  static async cleanupExpiredStories(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id')

      if (error) {
        handleSupabaseError(error, 'cleanup expired stories')
      }

      return data?.length || 0
    } catch (error) {
      console.error('Error cleaning up expired stories:', error)
      throw error
    }
  }

  // Subscribe to real-time story changes
  static subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('stories-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories'
        },
        (payload) => {
          console.log('Story change detected:', payload)
          callback(payload)
        }
      )
      .subscribe()
  }

  // Get story statistics
  static async getStats(): Promise<{
    totalStories: number
    activeStories: number
    storiesThisWeek: number
    averageStoriesPerBarraca: number
  }> {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Get total stories
      const { count: totalCount, error: totalError } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })

      if (totalError) {
        handleSupabaseError(totalError, 'get total story count')
      }

      // Get active stories
      const { count: activeCount, error: activeError } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gt('expires_at', now.toISOString())

      if (activeError) {
        handleSupabaseError(activeError, 'get active story count')
      }

      // Get stories this week
      const { count: weekCount, error: weekError } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString())

      if (weekError) {
        handleSupabaseError(weekError, 'get weekly story count')
      }

      // Get unique barracas with stories
      const { data: barracaData, error: barracaError } = await supabase
        .from('stories')
        .select('barraca_id')
        .eq('is_active', true)
        .gt('expires_at', now.toISOString())

      if (barracaError) {
        handleSupabaseError(barracaError, 'get barraca story data')
      }

      const uniqueBarracas = new Set(barracaData?.map(item => item.barraca_id)).size
      const averageStoriesPerBarraca = uniqueBarracas > 0 ? (activeCount || 0) / uniqueBarracas : 0

      return {
        totalStories: totalCount || 0,
        activeStories: activeCount || 0,
        storiesThisWeek: weekCount || 0,
        averageStoriesPerBarraca: Math.round(averageStoriesPerBarraca * 10) / 10
      }
    } catch (error) {
      console.error('Error getting story stats:', error)
      throw error
    }
  }
}