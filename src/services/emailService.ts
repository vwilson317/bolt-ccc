import { supabase, handleSupabaseError } from '../lib/supabase'
import type { EmailSubscription } from '../types'
import type { Database } from '../types/database'

type EmailSubscriptionRow = Database['public']['Tables']['email_subscriptions']['Row']
type EmailSubscriptionInsert = Database['public']['Tables']['email_subscriptions']['Insert']

// Transform database row to application type
const transformEmailSubscriptionFromDB = (row: EmailSubscriptionRow): EmailSubscription => ({
  email: row.email,
  subscribedAt: new Date(row.subscribed_at),
  preferences: row.preferences as any
})

export class EmailService {
  // Subscribe email
  static async subscribe(
    email: string, 
    preferences: { newBarracas: boolean; specialOffers: boolean } = { newBarracas: true, specialOffers: true }
  ): Promise<boolean> {
    try {
      // Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from('email_subscriptions')
        .select('email, is_active')
        .eq('email', email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        handleSupabaseError(checkError, 'check existing email subscription')
      }

      if (existing) {
        if (existing.is_active) {
          // Already subscribed and active
          return true
        } else {
          // Reactivate subscription
          const { error: updateError } = await supabase
            .from('email_subscriptions')
            .update({ 
              is_active: true, 
              preferences,
              subscribed_at: new Date().toISOString()
            })
            .eq('email', email)

          if (updateError) {
            handleSupabaseError(updateError, 'reactivate email subscription')
          }

          return true
        }
      }

      // Create new subscription
      const subscriptionData: EmailSubscriptionInsert = {
        email,
        preferences,
        is_active: true
      }

      const { error } = await supabase
        .from('email_subscriptions')
        .insert(subscriptionData)

      if (error) {
        handleSupabaseError(error, 'create email subscription')
      }

      return true
    } catch (error) {
      console.error('Error subscribing email:', error)
      return false
    }
  }

  // Unsubscribe email
  static async unsubscribe(email: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ is_active: false })
        .eq('email', email)

      if (error) {
        handleSupabaseError(error, 'unsubscribe email')
      }

      return true
    } catch (error) {
      console.error('Error unsubscribing email:', error)
      return false
    }
  }

  // Unsubscribe by token
  static async unsubscribeByToken(token: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ is_active: false })
        .eq('unsubscribe_token', token)

      if (error) {
        handleSupabaseError(error, 'unsubscribe by token')
      }

      return true
    } catch (error) {
      console.error('Error unsubscribing by token:', error)
      return false
    }
  }

  // Get all active subscriptions
  static async getActiveSubscriptions(): Promise<EmailSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'get active subscriptions')
      }

      return data?.map(transformEmailSubscriptionFromDB) || []
    } catch (error) {
      console.error('Error getting active subscriptions:', error)
      throw error
    }
  }

  // Get subscription by email
  static async getByEmail(email: string): Promise<EmailSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        handleSupabaseError(error, 'get subscription by email')
      }

      return data ? transformEmailSubscriptionFromDB(data) : null
    } catch (error) {
      console.error('Error getting subscription by email:', error)
      throw error
    }
  }

  // Update subscription preferences
  static async updatePreferences(
    email: string, 
    preferences: { newBarracas: boolean; specialOffers: boolean }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ preferences })
        .eq('email', email)
        .eq('is_active', true)

      if (error) {
        handleSupabaseError(error, 'update subscription preferences')
      }

      return true
    } catch (error) {
      console.error('Error updating subscription preferences:', error)
      return false
    }
  }

  // Get subscription statistics
  static async getStats(): Promise<{
    totalSubscriptions: number
    newThisWeek: number
    newThisMonth: number
    activeSubscriptions: number
  }> {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Get total subscriptions
      const { count: totalCount, error: totalError } = await supabase
        .from('email_subscriptions')
        .select('*', { count: 'exact', head: true })

      if (totalError) {
        handleSupabaseError(totalError, 'get total subscription count')
      }

      // Get active subscriptions
      const { count: activeCount, error: activeError } = await supabase
        .from('email_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (activeError) {
        handleSupabaseError(activeError, 'get active subscription count')
      }

      // Get new subscriptions this week
      const { count: weekCount, error: weekError } = await supabase
        .from('email_subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('subscribed_at', oneWeekAgo.toISOString())

      if (weekError) {
        handleSupabaseError(weekError, 'get weekly subscription count')
      }

      // Get new subscriptions this month
      const { count: monthCount, error: monthError } = await supabase
        .from('email_subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('subscribed_at', oneMonthAgo.toISOString())

      if (monthError) {
        handleSupabaseError(monthError, 'get monthly subscription count')
      }

      return {
        totalSubscriptions: totalCount || 0,
        activeSubscriptions: activeCount || 0,
        newThisWeek: weekCount || 0,
        newThisMonth: monthCount || 0
      }
    } catch (error) {
      console.error('Error getting subscription stats:', error)
      throw error
    }
  }
}