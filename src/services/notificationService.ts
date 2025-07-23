import { supabase } from '../lib/supabase';

export class NotificationService {
  /**
   * Save FCM token to Supabase for push notifications
   */
  static async saveToken(sessionId: string, fcmToken: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_tokens')
        .upsert({
          session_id: sessionId,
          fcm_token: fcmToken,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'session_id'
        });

      if (error) {
        console.error('Error saving FCM token:', error);
        throw error;
      }

      console.log('FCM token saved successfully');
    } catch (error) {
      console.error('Failed to save FCM token:', error);
      throw error;
    }
  }

  /**
   * Get FCM token for a session
   */
  static async getToken(sessionId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('notification_tokens')
        .select('fcm_token')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('Error getting FCM token:', error);
        return null;
      }

      return data?.fcm_token || null;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Delete FCM token for a session
   */
  static async deleteToken(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_tokens')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error deleting FCM token:', error);
        throw error;
      }

      console.log('FCM token deleted successfully');
    } catch (error) {
      console.error('Failed to delete FCM token:', error);
      throw error;
    }
  }

  /**
   * Get all FCM tokens for sending notifications
   */
  static async getAllTokens(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('notification_tokens')
        .select('fcm_token');

      if (error) {
        console.error('Error getting all FCM tokens:', error);
        return [];
      }

      return data?.map((row: { fcm_token: string }) => row.fcm_token).filter(Boolean) || [];
    } catch (error) {
      console.error('Failed to get all FCM tokens:', error);
      return [];
    }
  }

  /**
   * Send push notification to all registered tokens
   */
  static async sendNotificationToAll(title: string, body: string, data?: Record<string, any>): Promise<void> {
    try {
      const tokens = await this.getAllTokens();
      
      if (tokens.length === 0) {
        console.log('No FCM tokens found');
        return;
      }

      // This would typically call a serverless function or external service
      // to send the actual push notifications
      console.log(`Would send notification to ${tokens.length} tokens:`, {
        title,
        body,
        data
      });

      // For now, we'll just log the notification
      // In production, you'd call your notification sending service here
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send push notification to specific session
   */
  static async sendNotificationToSession(sessionId: string, title: string, body: string, data?: Record<string, any>): Promise<void> {
    try {
      const token = await this.getToken(sessionId);
      
      if (!token) {
        console.log(`No FCM token found for session: ${sessionId}`);
        return;
      }

      // This would typically call a serverless function or external service
      // to send the actual push notification
      console.log(`Would send notification to session ${sessionId}:`, {
        title,
        body,
        data
      });

      // For now, we'll just log the notification
      // In production, you'd call your notification sending service here
    } catch (error) {
      console.error('Failed to send notification to session:', error);
      throw error;
    }
  }

  /**
   * Check if push notifications are supported
   */
  static isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Request notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    return await Notification.requestPermission();
  }

  /**
   * Check if notification permission is granted
   */
  static isPermissionGranted(): boolean {
    return Notification.permission === 'granted';
  }
} 