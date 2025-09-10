// Firestore removed; external status API is deprecated and now a no-op or can be wired to Supabase if needed

export interface ExternalStatusUpdate {
  barracaId: string;
  isOpen?: boolean;
  manualStatus?: 'open' | 'closed' | 'undefined';
  specialAdminOverride?: boolean;
  specialAdminOverrideExpires?: Date;
  apiKey?: string; // For authentication
}

export class ExternalApiService {
  private static readonly API_KEY = (import.meta as any).env?.VITE_EXTERNAL_API_KEY || 'default-key';

  /**
   * Validate API key
   */
  private static validateApiKey(apiKey?: string): boolean {
    return apiKey === this.API_KEY;
  }

  /**
   * Update barraca status from external app
   */
  static async updateBarracaStatus(update: ExternalStatusUpdate): Promise<{ success: boolean; message: string }> {
    try {
      // Validate API key
      if (!this.validateApiKey(update.apiKey)) {
        return { success: false, message: 'Invalid API key' };
      }

      // Validate barraca ID
      if (!update.barracaId) {
        return { success: false, message: 'Barraca ID is required' };
      }

      // Deprecated: No Firestore updates. Consider wiring to Supabase RPC if needed.

      return { 
        success: true, 
        message: `No-op: Firestore disabled. Skipped updating status for barraca ${update.barracaId}` 
      };

    } catch (error) {
      console.error('Error updating barraca status from external app:', error);
      return { 
        success: false, 
        message: `Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Get current status for a barraca
   */
  static async getBarracaStatus(barracaId: string, apiKey?: string): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      // Validate API key
      if (!this.validateApiKey(apiKey)) {
        return { success: false, message: 'Invalid API key' };
      }

      // Deprecated: No Firestore. Always return not available.
      return { success: false, message: 'Status API disabled (Firestore removed)' };

    } catch (error) {
      console.error('Error getting barraca status:', error);
      return { 
        success: false, 
        message: `Error retrieving status: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}