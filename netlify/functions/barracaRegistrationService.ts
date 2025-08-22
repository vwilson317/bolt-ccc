import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Environment configuration for Netlify functions
const getEnvironmentConfig = () => {
  const env = process.env.VITE_APP_ENV || 'dev'
  
  console.log('Environment configuration:', {
    env,
    VITE_APP_ENV: process.env.VITE_APP_ENV,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_URL_PROD: process.env.VITE_SUPABASE_URL_PROD,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_ANON_KEY_PROD: process.env.VITE_SUPABASE_ANON_KEY_PROD,
  });
  
  const configs = {
    dev: {
      url: process.env.VITE_SUPABASE_URL_DEV || process.env.VITE_SUPABASE_URL,
      anonKey: process.env.VITE_SUPABASE_ANON_KEY_DEV || process.env.VITE_SUPABASE_ANON_KEY,
      schema: 'public'
    },
    qa: {
      url: process.env.VITE_SUPABASE_URL_QA || process.env.VITE_SUPABASE_URL,
      anonKey: process.env.VITE_SUPABASE_ANON_KEY_QA || process.env.VITE_SUPABASE_ANON_KEY,
      schema: 'public'
    },
    uat: {
      url: process.env.VITE_SUPABASE_URL_UAT || process.env.VITE_SUPABASE_URL,
      anonKey: process.env.VITE_SUPABASE_ANON_KEY_UAT || process.env.VITE_SUPABASE_ANON_KEY,
      schema: 'public'
    },
    prod: {
      url: process.env.VITE_SUPABASE_URL_PROD || process.env.VITE_SUPABASE_URL,
      anonKey: process.env.VITE_SUPABASE_ANON_KEY_PROD || process.env.VITE_SUPABASE_ANON_KEY,
      schema: 'public'
    }
  }
  
  const config = configs[env as keyof typeof configs] || configs.dev;
  
  console.log('Selected config:', {
    env,
    url: config.url ? `${config.url.substring(0, 20)}...` : 'undefined',
    anonKey: config.anonKey ? `${config.anonKey.substring(0, 20)}...` : 'undefined',
    schema: config.schema
  });
  
  return config;
}

const config = getEnvironmentConfig();

// Validate configuration
if (!config.url || !config.anonKey) {
  console.error('Missing Supabase configuration:', {
    url: config.url ? 'present' : 'missing',
    anonKey: config.anonKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase URL or anonymous key');
}

// Create Supabase client for Netlify functions
const supabase = createClient(config.url!, config.anonKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Transform registration data to database format
const transformRegistrationToDB = (registration: any): any => ({
  id: uuidv4(),
  name: registration.name,
  owner_name: registration.ownerName,
  barraca_number: registration.barracaNumber || null,
  location: registration.location,
  coordinates: registration.coordinates,
  typical_hours: registration.typicalHours,
  description: registration.description,
  nearest_posto: registration.nearestPosto,
  contact: registration.contact,
  amenities: registration.amenities,
  environment: registration.environment,
  default_photo: registration.defaultPhoto || null,
  weekend_hours_enabled: registration.weekendHoursEnabled,
  weekend_hours: registration.weekendHours || null,
  additional_info: registration.additionalInfo || null,
  // Partnership opportunities
  qr_codes: registration.qrCodes || false,
  repeat_discounts: registration.repeatDiscounts || false,
  hotel_partnerships: registration.hotelPartnerships || false,
  content_creation: registration.contentCreation || false,
  online_orders: registration.onlineOrders || false,
  // Contact preferences for photos and status updates
  contact_for_photos: registration.contactForPhotos || false,
  contact_for_status: registration.contactForStatus || false,
  preferred_contact_method: registration.preferredContactMethod || null,
  status: 'pending',
  submitted_at: new Date().toISOString(),
  reviewed_at: null,
  reviewed_by: null,
  admin_notes: null
});

// Transform database row to registration object
const transformRegistrationFromDB = (row: any): any => ({
  id: row.id,
  name: row.name,
  ownerName: row.owner_name,
  barracaNumber: row.barraca_number,
  location: row.location,
  coordinates: row.coordinates,
  typicalHours: row.typical_hours,
  description: row.description,
  nearestPosto: row.nearest_posto,
  contact: row.contact,
  amenities: row.amenities,
  environment: row.environment,
  defaultPhoto: row.default_photo,
  weekendHoursEnabled: row.weekend_hours_enabled,
  weekendHours: row.weekend_hours,
  additionalInfo: row.additional_info,
  // Partnership opportunities
  qrCodes: row.qr_codes,
  repeatDiscounts: row.repeat_discounts,
  hotelPartnerships: row.hotel_partnerships,
  contentCreation: row.content_creation,
  onlineOrders: row.online_orders,
  // Contact preferences for photos and status updates
  contactForPhotos: row.contact_for_photos,
  contactForStatus: row.contact_for_status,
  preferredContactMethod: row.preferred_contact_method,
  status: row.status,
  submittedAt: new Date(row.submitted_at),
  reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
  reviewedBy: row.reviewed_by,
  adminNotes: row.admin_notes
});

export class BarracaRegistrationService {
  // Submit a new barraca registration
  static async submit(registration: any): Promise<any> {
    try {
      console.log('Starting registration submission...');
      const registrationData = transformRegistrationToDB(registration);
      console.log('Transformed data:', JSON.stringify(registrationData, null, 2));

      console.log('Attempting to insert into database...');
      const { data, error } = await supabase
        .from('barraca_registrations')
        .insert(registrationData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to submit registration: ${error.message}`);
      }

      console.log('Database insert successful:', data);
      const result = transformRegistrationFromDB(data);
      console.log('Transformed result:', result);
      
      return result;
    } catch (error) {
      console.error('Error in submit registration:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  // Get all registrations (admin only)
  static async getAll(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<{ registrations: any[]; total: number }> {
    try {
      let query = supabase
        .from('barraca_registrations')
        .select('*', { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query
        .order('submitted_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw new Error(`Failed to fetch registrations: ${error.message}`);
      }

      return {
        registrations: data?.map(transformRegistrationFromDB) || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getAll registrations:', error);
      throw error;
    }
  }
}
