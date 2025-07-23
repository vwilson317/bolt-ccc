import { FirestoreService } from './firestoreService';

export interface ExternalStatusUpdate {
  barracaId: string;
  isOpen?: boolean;
  manualStatus?: 'open' | 'closed' | 'undefined';
  specialAdminOverride?: boolean;
  specialAdminOverrideExpires?: Date;
  apiKey?: string; // For authentication
}

export class ExternalApiService {
  private static readonly API_KEY = import.meta.env.VITE_EXTERNAL_API_KEY || 'default-key';

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

      // Prepare status update
      const statusUpdate: Partial<{
        isOpen: boolean;
        manualStatus: 'open' | 'closed' | 'undefined';
        specialAdminOverride: boolean;
        specialAdminOverrideExpires: Date;
      }> = {};

      if (update.isOpen !== undefined) {
        statusUpdate.isOpen = update.isOpen;
      }

      if (update.manualStatus !== undefined) {
        statusUpdate.manualStatus = update.manualStatus;
      }

      if (update.specialAdminOverride !== undefined) {
        statusUpdate.specialAdminOverride = update.specialAdminOverride;
      }

      if (update.specialAdminOverrideExpires !== undefined) {
        statusUpdate.specialAdminOverrideExpires = update.specialAdminOverrideExpires;
      }

      // Update in Firestore
      await FirestoreService.updateBarracaStatus(update.barracaId, statusUpdate, 'external');

      return { 
        success: true, 
        message: `Successfully updated status for barraca ${update.barracaId}` 
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

      const status = await FirestoreService.getBarracaStatus(barracaId);
      
      if (status) {
        return { success: true, data: status, message: 'Status retrieved successfully' };
      } else {
        return { success: false, message: 'Barraca status not found' };
      }

    } catch (error) {
      console.error('Error getting barraca status:', error);
      return { 
        success: false, 
        message: `Error retrieving status: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}