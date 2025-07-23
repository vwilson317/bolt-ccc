import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc, 
  getDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { firebaseApp } from '../lib/firebase';
import type { Barraca } from '../types';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Firestore collection names
const COLLECTIONS = {
  BARRACA_STATUS: 'barraca_status',
  BARRACAS: 'barracas'
} as const;

// Types for Firestore documents
export interface BarracaStatus {
  barracaId: string;
  isOpen: boolean;
  manualStatus: 'open' | 'closed' | 'undefined';
  specialAdminOverride: boolean;
  specialAdminOverrideExpires: Date | null;
  lastUpdated: Date;
  updatedBy: string; // 'system' | 'manual' | 'external'
}

export interface FirestoreBarraca {
  id: string;
  name: string;
  barracaNumber?: string;
  location: string;
  coordinates: { lat: number; lng: number };
  typicalHours: string;
  description: string;
  photos: any;
  menuPreview: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  amenities: string[];
  weatherDependent: boolean;
  partnered: boolean;
  weekendHoursEnabled: boolean;
  weekendHours?: {
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  createdAt: Date;
  updatedAt: Date;
  ctaButtons?: any[];
}

export class FirestoreService {
  private static statusSubscriptions = new Map<string, Unsubscribe>();
  private static barracaSubscriptions = new Map<string, Unsubscribe>();

  /**
   * Subscribe to real-time barraca status updates
   */
  static subscribeToBarracaStatus(
    barracaId: string,
    callback: (status: BarracaStatus | null) => void
  ): Unsubscribe {
    // Unsubscribe from existing subscription if any
    if (this.statusSubscriptions.has(barracaId)) {
      this.statusSubscriptions.get(barracaId)?.();
    }

    const statusRef = doc(db, COLLECTIONS.BARRACA_STATUS, barracaId);
    
    const unsubscribe = onSnapshot(statusRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const status: BarracaStatus = {
          barracaId: doc.id,
          isOpen: data.isOpen || false,
          manualStatus: data.manualStatus || 'undefined',
          specialAdminOverride: data.specialAdminOverride || false,
          specialAdminOverrideExpires: data.specialAdminOverrideExpires?.toDate() || null,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          updatedBy: data.updatedBy || 'system'
        };
        callback(status);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error subscribing to barraca status:', error);
      callback(null);
    });

    this.statusSubscriptions.set(barracaId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to all barraca status updates
   */
  static subscribeToAllBarracaStatus(
    callback: (statuses: BarracaStatus[]) => void
  ): Unsubscribe {
    const statusesRef = collection(db, COLLECTIONS.BARRACA_STATUS);
    const q = query(statusesRef, orderBy('lastUpdated', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const statuses: BarracaStatus[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        statuses.push({
          barracaId: doc.id,
          isOpen: data.isOpen || false,
          manualStatus: data.manualStatus || 'undefined',
          specialAdminOverride: data.specialAdminOverride || false,
          specialAdminOverrideExpires: data.specialAdminOverrideExpires?.toDate() || null,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          updatedBy: data.updatedBy || 'system'
        });
      });
      callback(statuses);
    }, (error) => {
      console.error('Error subscribing to all barraca status:', error);
      callback([]);
    });

    return unsubscribe;
  }

  /**
   * Subscribe to real-time barraca data updates
   */
  static subscribeToBarracas(
    callback: (barracas: FirestoreBarraca[]) => void
  ): Unsubscribe {
    const barracasRef = collection(db, COLLECTIONS.BARRACAS);
    const q = query(barracasRef, orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const barracas: FirestoreBarraca[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        barracas.push({
          id: doc.id,
          name: data.name,
          barracaNumber: data.barracaNumber,
          location: data.location,
          coordinates: data.coordinates,
          typicalHours: data.typicalHours,
          description: data.description,
          photos: data.photos,
          menuPreview: data.menuPreview,
          contact: data.contact,
          amenities: data.amenities,
          weatherDependent: data.weatherDependent,
          partnered: data.partnered,
          weekendHoursEnabled: data.weekendHoursEnabled,
          weekendHours: data.weekendHours,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          ctaButtons: data.ctaButtons
        });
      });
      callback(barracas);
    }, (error) => {
      console.error('Error subscribing to barracas:', error);
      callback([]);
    });

    this.barracaSubscriptions.set('all', unsubscribe);
    return unsubscribe;
  }

  /**
   * Update barraca status (for external app)
   */
  static async updateBarracaStatus(
    barracaId: string,
    status: Partial<Omit<BarracaStatus, 'barracaId' | 'lastUpdated'>>,
    updatedBy: string = 'external'
  ): Promise<void> {
    try {
      const statusRef = doc(db, COLLECTIONS.BARRACA_STATUS, barracaId);
      await updateDoc(statusRef, {
        ...status,
        lastUpdated: serverTimestamp(),
        updatedBy
      });
      console.log(`✅ Updated barraca status for ${barracaId}`);
    } catch (error) {
      console.error('Error updating barraca status:', error);
      throw error;
    }
  }

  /**
   * Set manual status for non-partnered barracas
   */
  static async setManualStatus(
    barracaId: string,
    manualStatus: 'open' | 'closed' | 'undefined',
    updatedBy: string = 'manual'
  ): Promise<void> {
    try {
      const statusRef = doc(db, COLLECTIONS.BARRACA_STATUS, barracaId);
      await setDoc(statusRef, {
        barracaId,
        manualStatus,
        isOpen: manualStatus === 'open',
        lastUpdated: serverTimestamp(),
        updatedBy
      }, { merge: true });
      console.log(`✅ Set manual status for ${barracaId}: ${manualStatus}`);
    } catch (error) {
      console.error('Error setting manual status:', error);
      throw error;
    }
  }

  /**
   * Set special admin override
   */
  static async setSpecialAdminOverride(
    barracaId: string,
    override: boolean,
    expiresAt?: Date,
    updatedBy: string = 'admin'
  ): Promise<void> {
    try {
      const statusRef = doc(db, COLLECTIONS.BARRACA_STATUS, barracaId);
      await setDoc(statusRef, {
        barracaId,
        specialAdminOverride: override,
        specialAdminOverrideExpires: expiresAt,
        isOpen: override,
        lastUpdated: serverTimestamp(),
        updatedBy
      }, { merge: true });
      console.log(`✅ Set special admin override for ${barracaId}: ${override}`);
    } catch (error) {
      console.error('Error setting special admin override:', error);
      throw error;
    }
  }

  /**
   * Sync barraca data from Supabase to Firestore
   */
  static async syncBarracaToFirestore(barraca: Barraca): Promise<void> {
    try {
      const barracaRef = doc(db, COLLECTIONS.BARRACAS, barraca.id);
      await setDoc(barracaRef, {
        id: barraca.id,
        name: barraca.name,
        barracaNumber: barraca.barracaNumber,
        location: barraca.location,
        coordinates: barraca.coordinates,
        typicalHours: barraca.typicalHours,
        description: barraca.description,
        photos: barraca.photos,
        menuPreview: barraca.menuPreview,
        contact: barraca.contact,
        amenities: barraca.amenities,
        weatherDependent: barraca.weatherDependent,
        partnered: barraca.partnered,
        weekendHoursEnabled: barraca.weekendHoursEnabled,
        weekendHours: barraca.weekendHours,
        createdAt: barraca.createdAt,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Also sync status
      const statusRef = doc(db, COLLECTIONS.BARRACA_STATUS, barraca.id);
      await setDoc(statusRef, {
        barracaId: barraca.id,
        isOpen: barraca.isOpen,
        manualStatus: barraca.manualStatus || 'undefined',
        specialAdminOverride: barraca.specialAdminOverride,
        specialAdminOverrideExpires: barraca.specialAdminOverrideExpires,
        lastUpdated: serverTimestamp(),
        updatedBy: 'system'
      }, { merge: true });

      console.log(`✅ Synced barraca ${barraca.id} to Firestore`);
    } catch (error) {
      console.error('Error syncing barraca to Firestore:', error);
      throw error;
    }
  }

  /**
   * Clean up subscriptions
   */
  static cleanup(): void {
    this.statusSubscriptions.forEach(unsubscribe => unsubscribe());
    this.statusSubscriptions.clear();
    this.barracaSubscriptions.forEach(unsubscribe => unsubscribe());
    this.barracaSubscriptions.clear();
  }

  /**
   * Get current status for a barraca
   */
  static async getBarracaStatus(barracaId: string): Promise<BarracaStatus | null> {
    try {
      const statusRef = doc(db, COLLECTIONS.BARRACA_STATUS, barracaId);
      const docSnap = await getDoc(statusRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          barracaId: docSnap.id,
          isOpen: data?.isOpen || false,
          manualStatus: data?.manualStatus || 'undefined',
          specialAdminOverride: data?.specialAdminOverride || false,
          specialAdminOverrideExpires: data?.specialAdminOverrideExpires?.toDate() || null,
          lastUpdated: data?.lastUpdated?.toDate() || new Date(),
          updatedBy: data?.updatedBy || 'system'
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting barraca status:', error);
      return null;
    }
  }
} 