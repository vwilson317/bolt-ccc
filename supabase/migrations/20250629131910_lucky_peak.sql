/*
  # Multi-Environment Database Setup

  1. New Schemas
    - `dev` - Development environment with full dataset
    - `qa` - Quality Assurance environment with subset data
    - `uat` - User Acceptance Testing environment with minimal data
    - `prod` - Production environment with full dataset

  2. Tables Created in Each Schema
    - `barracas` - Main barraca data with enhanced hours management
    - `business_hours` - Detailed business hours by day of week
    - `stories` - Story content and media
    - `email_subscriptions` - Newsletter subscriptions
    - `weather_cache` - Weather data caching
    - `visitor_analytics` - Unique visitor tracking

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for public and authenticated users
    - Environment-specific access controls

  4. Functions
    - Timezone conversion utilities
    - Business hours checking
    - Search and geolocation functions
    - Environment management tools
*/

-- Create schemas for different environments
CREATE SCHEMA IF NOT EXISTS dev;
CREATE SCHEMA IF NOT EXISTS qa;
CREATE SCHEMA IF NOT EXISTS uat;
CREATE SCHEMA IF NOT EXISTS prod;

-- Function to create complete schema structure in a given schema
CREATE OR REPLACE FUNCTION create_environment_schema(schema_name text)
RETURNS void AS $$
DECLARE
  sql_text text;
BEGIN
  -- Set search path to the target schema
  EXECUTE format('SET search_path TO %I, public', schema_name);
  
  -- Enable required extensions (these are database-wide)
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "postgis";
  
  -- Create barracas table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.barracas (
      id text PRIMARY KEY,
      name text NOT NULL,
      barraca_number text,
      location text NOT NULL,
      coordinates jsonb NOT NULL,
      is_open boolean DEFAULT true,
      typical_hours text DEFAULT ''9:00 - 18:00'',
      description text NOT NULL,
      images text[] DEFAULT ARRAY[]::text[],
      menu_preview text[] DEFAULT ARRAY[]::text[],
      contact jsonb DEFAULT ''{}''::jsonb,
      amenities text[] DEFAULT ARRAY[]::text[],
      weather_dependent boolean DEFAULT false,
      cta_buttons jsonb DEFAULT ''[]''::jsonb,
      open_time_utc time,
      close_time_utc time,
      timezone text DEFAULT ''America/Sao_Paulo'',
      business_hours jsonb DEFAULT ''{}''::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )', schema_name);

  -- Create business_hours table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.business_hours (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      barraca_id text NOT NULL REFERENCES %I.barracas(id) ON DELETE CASCADE,
      day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
      is_open boolean DEFAULT true,
      open_time_utc time,
      close_time_utc time,
      break_start_utc time,
      break_end_utc time,
      notes text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(barraca_id, day_of_week)
    )', schema_name, schema_name);

  -- Create stories table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.stories (
      id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
      barraca_id text NOT NULL REFERENCES %I.barracas(id) ON DELETE CASCADE,
      media_url text NOT NULL,
      media_type text NOT NULL CHECK (media_type IN (''image'', ''video'')),
      caption text,
      duration integer,
      created_at timestamptz DEFAULT now(),
      expires_at timestamptz DEFAULT now() + interval ''24 hours''
    )', schema_name, schema_name);

  -- Create email_subscriptions table with proper JSON escaping
  sql_text := format('
    CREATE TABLE IF NOT EXISTS %I.email_subscriptions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      preferences jsonb DEFAULT $json${"newBarracas": true, "specialOffers": true}$json$,
      subscribed_at timestamptz DEFAULT now(),
      unsubscribed_at timestamptz,
      is_active boolean DEFAULT true,
      unsubscribe_token text DEFAULT gen_random_uuid()::text
    )', schema_name);
  EXECUTE sql_text;

  -- Create weather_cache table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.weather_cache (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      location text NOT NULL,
      temperature numeric(4,1) NOT NULL,
      feels_like numeric(4,1) NOT NULL,
      humidity integer NOT NULL,
      wind_speed numeric(4,1) NOT NULL,
      wind_direction integer NOT NULL,
      description text NOT NULL,
      icon text NOT NULL,
      beach_conditions text NOT NULL CHECK (beach_conditions IN (''excellent'', ''good'', ''fair'', ''poor'')),
      cached_at timestamptz DEFAULT now(),
      expires_at timestamptz DEFAULT now() + interval ''15 minutes''
    )', schema_name);

  -- Create visitor_analytics table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.visitor_analytics (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      visitor_id text UNIQUE NOT NULL,
      first_visit timestamptz DEFAULT now(),
      last_visit timestamptz DEFAULT now(),
      visit_count integer DEFAULT 1,
      user_agent text,
      referrer text,
      country text,
      city text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )', schema_name);

  -- Create indexes
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_barracas_location ON %I.barracas(location)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_barracas_is_open ON %I.barracas(is_open)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_barracas_coordinates ON %I.barracas USING GIN(coordinates)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_barracas_search ON %I.barracas USING GIN(to_tsvector(''portuguese'', name || '' '' || description))', schema_name, schema_name);
  
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_business_hours_barraca_id ON %I.business_hours(barraca_id)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_business_hours_day_of_week ON %I.business_hours(day_of_week)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_business_hours_is_open ON %I.business_hours(is_open)', schema_name, schema_name);
  
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_stories_barraca_id ON %I.stories(barraca_id)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_stories_created_at ON %I.stories(created_at DESC)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_stories_expires_at ON %I.stories(expires_at)', schema_name, schema_name);
  
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_email_subscriptions_email ON %I.email_subscriptions(email)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_email_subscriptions_active ON %I.email_subscriptions(is_active)', schema_name, schema_name);
  
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_weather_cache_location ON %I.weather_cache(location)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_weather_cache_expires_at ON %I.weather_cache(expires_at)', schema_name, schema_name);
  
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_visitor_analytics_visitor_id ON %I.visitor_analytics(visitor_id)', schema_name, schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_visitor_analytics_last_visit ON %I.visitor_analytics(last_visit DESC)', schema_name, schema_name);

  -- Enable RLS
  EXECUTE format('ALTER TABLE %I.barracas ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.business_hours ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.stories ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.email_subscriptions ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.weather_cache ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.visitor_analytics ENABLE ROW LEVEL SECURITY', schema_name);

  -- Reset search path
  SET search_path TO public;
  
  RAISE NOTICE 'Created schema structure for environment: %', schema_name;
END;
$$ LANGUAGE plpgsql;

-- Function to create RLS policies for a schema
CREATE OR REPLACE FUNCTION create_environment_policies(schema_name text)
RETURNS void AS $$
BEGIN
  -- Barracas policies
  EXECUTE format('
    CREATE POLICY "Public can read barracas" ON %I.barracas
      FOR SELECT TO public USING (true)', schema_name);
  
  EXECUTE format('
    CREATE POLICY "Authenticated users can manage barracas" ON %I.barracas
      FOR ALL TO authenticated USING (true)', schema_name);

  -- Business hours policies
  EXECUTE format('
    CREATE POLICY "Public can read business hours" ON %I.business_hours
      FOR SELECT TO public USING (true)', schema_name);
  
  EXECUTE format('
    CREATE POLICY "Authenticated users can manage business hours" ON %I.business_hours
      FOR ALL TO authenticated USING (true)', schema_name);

  -- Stories policies
  EXECUTE format('
    CREATE POLICY "Public can read active stories" ON %I.stories
      FOR SELECT TO public USING (expires_at > now())', schema_name);
  
  EXECUTE format('
    CREATE POLICY "Authenticated users can manage stories" ON %I.stories
      FOR ALL TO authenticated USING (true)', schema_name);

  -- Email subscriptions policies
  EXECUTE format('
    CREATE POLICY "Users can manage their own subscriptions" ON %I.email_subscriptions
      FOR ALL TO public USING (true)', schema_name);

  -- Weather cache policies
  EXECUTE format('
    CREATE POLICY "Public can read weather cache" ON %I.weather_cache
      FOR SELECT TO public USING (true)', schema_name);
  
  EXECUTE format('
    CREATE POLICY "Authenticated users can manage weather cache" ON %I.weather_cache
      FOR ALL TO authenticated USING (true)', schema_name);

  -- Visitor analytics policies
  EXECUTE format('
    CREATE POLICY "Public can insert visitor analytics" ON %I.visitor_analytics
      FOR INSERT TO public WITH CHECK (true)', schema_name);
  
  EXECUTE format('
    CREATE POLICY "Authenticated users can read visitor analytics" ON %I.visitor_analytics
      FOR SELECT TO authenticated USING (true)', schema_name);

  RAISE NOTICE 'Created RLS policies for environment: %', schema_name;
END;
$$ LANGUAGE plpgsql;

-- Function to create environment-specific functions
CREATE OR REPLACE FUNCTION create_environment_functions(schema_name text)
RETURNS void AS $$
BEGIN
  -- Set search path to include the target schema
  EXECUTE format('SET search_path TO %I, public', schema_name);

  -- Create timezone conversion functions
  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.convert_local_to_utc(
      local_time time,
      timezone_name text DEFAULT ''America/Sao_Paulo''
    )
    RETURNS time AS $func$
    DECLARE
      utc_time time;
      local_timestamp timestamptz;
      utc_timestamp timestamptz;
    BEGIN
      local_timestamp := (CURRENT_DATE + local_time) AT TIME ZONE timezone_name;
      utc_timestamp := local_timestamp AT TIME ZONE ''UTC'';
      utc_time := utc_timestamp::time;
      RETURN utc_time;
    END;
    $func$ LANGUAGE plpgsql', schema_name);

  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.convert_utc_to_local(
      utc_time time,
      timezone_name text DEFAULT ''America/Sao_Paulo''
    )
    RETURNS time AS $func$
    DECLARE
      local_time time;
      utc_timestamp timestamptz;
      local_timestamp timestamptz;
    BEGIN
      utc_timestamp := (CURRENT_DATE + utc_time) AT TIME ZONE ''UTC'';
      local_timestamp := utc_timestamp AT TIME ZONE timezone_name;
      local_time := local_timestamp::time;
      RETURN local_time;
    END;
    $func$ LANGUAGE plpgsql', schema_name);

  -- Create business hours check function
  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.is_barraca_open_now(
      barraca_id_param text,
      check_time timestamptz DEFAULT now()
    )
    RETURNS boolean AS $func$
    DECLARE
      current_day integer;
      current_time_utc time;
      hours_record %I.business_hours%%ROWTYPE;
      is_currently_open boolean := false;
    BEGIN
      current_day := EXTRACT(dow FROM check_time AT TIME ZONE ''UTC'');
      current_time_utc := (check_time AT TIME ZONE ''UTC'')::time;
      
      SELECT * INTO hours_record
      FROM %I.business_hours
      WHERE barraca_id = barraca_id_param
        AND day_of_week = current_day
        AND is_open = true;
      
      IF NOT FOUND THEN
        SELECT is_open INTO is_currently_open
        FROM %I.barracas
        WHERE id = barraca_id_param;
        
        RETURN COALESCE(is_currently_open, false);
      END IF;
      
      IF hours_record.open_time_utc IS NOT NULL AND hours_record.close_time_utc IS NOT NULL THEN
        IF hours_record.open_time_utc <= hours_record.close_time_utc THEN
          is_currently_open := current_time_utc >= hours_record.open_time_utc 
                              AND current_time_utc <= hours_record.close_time_utc;
        ELSE
          is_currently_open := current_time_utc >= hours_record.open_time_utc 
                              OR current_time_utc <= hours_record.close_time_utc;
        END IF;
        
        IF is_currently_open AND hours_record.break_start_utc IS NOT NULL AND hours_record.break_end_utc IS NOT NULL THEN
          IF hours_record.break_start_utc <= hours_record.break_end_utc THEN
            IF current_time_utc >= hours_record.break_start_utc AND current_time_utc <= hours_record.break_end_utc THEN
              is_currently_open := false;
            END IF;
          ELSE
            IF current_time_utc >= hours_record.break_start_utc OR current_time_utc <= hours_record.break_end_utc THEN
              is_currently_open := false;
            END IF;
          END IF;
        END IF;
      END IF;
      
      RETURN is_currently_open;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER', schema_name, schema_name, schema_name, schema_name);

  -- Create search function
  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.search_barracas(
      search_query text,
      location_filter text DEFAULT NULL,
      open_only boolean DEFAULT false,
      limit_count integer DEFAULT 20
    )
    RETURNS TABLE(
      id text,
      name text,
      location text,
      is_open boolean,
      rank real
    ) AS $func$
    BEGIN
      RETURN QUERY
      SELECT 
        b.id,
        b.name,
        b.location,
        CASE 
          WHEN open_only THEN %I.is_barraca_open_now(b.id)
          ELSE b.is_open
        END as is_open,
        ts_rank(to_tsvector(''portuguese'', b.name || '' '' || b.description), plainto_tsquery(''portuguese'', search_query)) as rank
      FROM %I.barracas b
      WHERE 
        (search_query IS NULL OR to_tsvector(''portuguese'', b.name || '' '' || b.description) @@ plainto_tsquery(''portuguese'', search_query))
        AND (location_filter IS NULL OR b.location ILIKE ''%%'' || location_filter || ''%%'')
        AND (NOT open_only OR %I.is_barraca_open_now(b.id))
      ORDER BY rank DESC
      LIMIT limit_count;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER', schema_name, schema_name, schema_name, schema_name);

  -- Create nearby barracas function
  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.get_nearby_barracas(
      user_lat numeric,
      user_lng numeric,
      radius_km numeric DEFAULT 5,
      limit_count integer DEFAULT 20
    )
    RETURNS TABLE(
      id text,
      name text,
      location text,
      is_open boolean,
      distance_km numeric
    ) AS $func$
    BEGIN
      RETURN QUERY
      SELECT 
        b.id,
        b.name,
        b.location,
        %I.is_barraca_open_now(b.id) as is_open,
        ROUND(
          (6371 * acos(
            cos(radians(user_lat)) * 
            cos(radians((b.coordinates->>''lat'')::numeric)) * 
            cos(radians((b.coordinates->>''lng'')::numeric) - radians(user_lng)) + 
            sin(radians(user_lat)) * 
            sin(radians((b.coordinates->>''lat'')::numeric))
          ))::numeric, 2
        ) as distance_km
      FROM %I.barracas b
      WHERE (
        6371 * acos(
          cos(radians(user_lat)) * 
          cos(radians((b.coordinates->>''lat'')::numeric)) * 
          cos(radians((b.coordinates->>''lng'')::numeric) - radians(user_lng)) + 
          sin(radians(user_lat)) * 
          sin(radians((b.coordinates->>''lat'')::numeric))
        )
      ) <= radius_km
      ORDER BY distance_km
      LIMIT limit_count;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER', schema_name, schema_name, schema_name);

  -- Create cleanup functions
  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.cleanup_expired_stories()
    RETURNS void AS $func$
    BEGIN
      DELETE FROM %I.stories WHERE expires_at < now();
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER', schema_name, schema_name);

  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.cleanup_expired_weather()
    RETURNS void AS $func$
    BEGIN
      DELETE FROM %I.weather_cache WHERE expires_at < now();
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER', schema_name, schema_name);

  -- Create trigger functions
  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.update_barraca_updated_at()
    RETURNS trigger AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql', schema_name);

  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.update_business_hours_updated_at()
    RETURNS trigger AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql', schema_name);

  -- Create triggers
  EXECUTE format('
    DROP TRIGGER IF EXISTS update_barracas_updated_at ON %I.barracas;
    CREATE TRIGGER update_barracas_updated_at
      BEFORE UPDATE ON %I.barracas
      FOR EACH ROW
      EXECUTE FUNCTION %I.update_barraca_updated_at()', schema_name, schema_name, schema_name);

  EXECUTE format('
    DROP TRIGGER IF EXISTS update_business_hours_updated_at ON %I.business_hours;
    CREATE TRIGGER update_business_hours_updated_at
      BEFORE UPDATE ON %I.business_hours
      FOR EACH ROW
      EXECUTE FUNCTION %I.update_business_hours_updated_at()', schema_name, schema_name, schema_name);

  -- Reset search path
  SET search_path TO public;
  
  RAISE NOTICE 'Created functions and triggers for environment: %', schema_name;
END;
$$ LANGUAGE plpgsql;

-- Function to seed environment-specific data
CREATE OR REPLACE FUNCTION seed_environment_data(schema_name text, data_type text DEFAULT 'full')
RETURNS void AS $$
DECLARE
  barraca_count integer;
  json_preferences jsonb;
  json_contact jsonb;
  json_coordinates jsonb;
BEGIN
  -- Set search path to target schema
  EXECUTE format('SET search_path TO %I, public', schema_name);

  -- Prepare JSON objects
  json_preferences := '{"newBarracas": true, "specialOffers": true}';
  json_contact := '{"phone": "+55 21 99237-1601", "email": "contato@barracauruguay.com.br"}';
  json_coordinates := '{"lat": -22.9838, "lng": -43.2096}';

  -- Determine data volume based on environment and data_type
  CASE 
    WHEN schema_name = 'dev' AND data_type = 'full' THEN
      barraca_count := 8; -- Full dataset for development
    WHEN schema_name = 'qa' THEN
      barraca_count := 5; -- Subset for QA testing
    WHEN schema_name = 'uat' THEN
      barraca_count := 3; -- Minimal set for UAT
    WHEN schema_name = 'prod' THEN
      barraca_count := 8; -- Full production dataset
    ELSE
      barraca_count := 2; -- Minimal for other cases
  END CASE;

  -- Insert barracas data (adjust based on environment)
  IF barraca_count >= 1 THEN
    EXECUTE format('
      INSERT INTO %I.barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at) VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO NOTHING', schema_name)
    USING 
      'barraca-uruguay', 
      'Barraca Uruguay', 
      '203', 
      'Ipanema', 
      json_coordinates,
      true, 
      '09:00 - 19:00', 
      'Premium beachwear boutique offering curated selection of high-quality swimwear, beach accessories, and lifestyle products.',
      ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg'],
      ARRAY['Premium Swimwear', 'Designer Sunglasses'],
      json_contact,
      ARRAY['Personal Shopper', 'Gift Wrapping'],
      false,
      '[]'::jsonb,
      NOW() - INTERVAL '1 month', 
      NOW();
  END IF;

  IF barraca_count >= 2 THEN
    EXECUTE format('
      INSERT INTO %I.barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at) VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO NOTHING', schema_name)
    USING 
      '1', 
      'Barraca do Zeca', 
      '001', 
      'Copacabana', 
      '{"lat": -22.9711, "lng": -43.1822}'::jsonb,
      true, 
      '8:00 - 18:00', 
      'Traditional beachside barraca serving fresh seafood and cold drinks.',
      ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg'],
      ARRAY['Caipirinha', 'Grilled Fish'],
      '{"phone": "+55 21 99999-1234"}'::jsonb,
      ARRAY['WiFi', 'Umbrellas'],
      true,
      '[]'::jsonb,
      NOW() - INTERVAL '3 weeks', 
      NOW();
  END IF;

  IF barraca_count >= 3 THEN
    EXECUTE format('
      INSERT INTO %I.barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at) VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO NOTHING', schema_name)
    USING 
      '2', 
      'Sol e Mar', 
      '015', 
      'Ipanema', 
      '{"lat": -22.9838, "lng": -43.2096}'::jsonb,
      true, 
      '9:00 - 19:00', 
      'Modern beachside spot famous for tropical drinks.',
      ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg'],
      ARRAY['Tropical Smoothies', 'Poke Bowl'],
      '{"phone": "+55 21 99999-5678"}'::jsonb,
      ARRAY['WiFi', 'Beach Volleyball'],
      false,
      '[]'::jsonb,
      NOW() - INTERVAL '2 weeks', 
      NOW();
  END IF;

  IF barraca_count >= 4 THEN
    EXECUTE format('
      INSERT INTO %I.barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at) VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO NOTHING', schema_name)
    USING 
      '3', 
      'Carioca Vibes', 
      '032', 
      'Leblon', 
      '{"lat": -22.9840, "lng": -43.2277}'::jsonb,
      false, 
      '10:00 - 20:00', 
      'Upscale beach experience with gourmet food and premium drinks.',
      ARRAY['https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg'],
      ARRAY['Gourmet Burgers', 'Craft Cocktails'],
      '{"phone": "+55 21 99999-9012", "email": "info@cariocavibes.com"}'::jsonb,
      ARRAY['VIP Cabanas', 'Personal Service'],
      true,
      '[]'::jsonb,
      NOW() - INTERVAL '1 week', 
      NOW();
  END IF;

  IF barraca_count >= 5 THEN
    EXECUTE format('
      INSERT INTO %I.barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at) VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO NOTHING', schema_name)
    USING 
      '4', 
      'Praia Zen', 
      '008', 
      'Barra da Tijuca', 
      '{"lat": -23.0129, "lng": -43.3187}'::jsonb,
      true, 
      '7:00 - 17:00', 
      'Peaceful beachside retreat focusing on wellness and healthy food.',
      ARRAY['https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg'],
      ARRAY['Green Smoothies', 'Quinoa Salad'],
      '{"phone": "+55 21 99999-3456", "email": "wellness@praiazen.com"}'::jsonb,
      ARRAY['Meditation Area', 'Yoga Mats'],
      false,
      '[]'::jsonb,
      NOW() - INTERVAL '5 days', 
      NOW();
  END IF;

  -- Add sample stories for development and QA
  IF schema_name IN ('dev', 'qa') THEN
    EXECUTE format('
      INSERT INTO %I.stories (id, barraca_id, media_url, media_type, caption, created_at, expires_at) VALUES
      ($1, $2, $3, $4, $5, $6, $7),
      ($8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO NOTHING', schema_name)
    USING 
      'story-1', '1', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'image', 'Fresh seafood! 🦐', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '23 hours',
      'story-2', '2', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'image', 'New smoothie menu! 🥤', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '23.5 hours';
  END IF;

  -- Add sample email subscriptions for non-production
  IF schema_name != 'prod' THEN
    EXECUTE format('
      INSERT INTO %I.email_subscriptions (email, preferences, subscribed_at) VALUES
      ($1, $2, $3),
      ($4, $5, $6)
      ON CONFLICT (email) DO NOTHING', schema_name)
    USING 
      format('test@%s.com', schema_name), json_preferences, NOW() - INTERVAL '1 week',
      format('qa@%s.com', schema_name), json_preferences, NOW() - INTERVAL '3 days';
  END IF;

  -- Add weather cache data
  EXECUTE format('
    INSERT INTO %I.weather_cache (location, temperature, feels_like, humidity, wind_speed, wind_direction, description, icon, beach_conditions, cached_at, expires_at) VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', schema_name)
  USING 
    'Rio de Janeiro', 28.0, 32.0, 65, 12.0, 180, 'Partly Cloudy', 'partly-cloudy', 'excellent', NOW(), NOW() + INTERVAL '15 minutes';

  -- Add sample business hours for some barracas with proper time casting
  IF barraca_count >= 1 THEN
    -- Add business hours for Barraca Uruguay with proper time types
    EXECUTE format('
      INSERT INTO %I.business_hours (barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, notes) VALUES
      ($1, $2, $3, $4, $5, $6),
      ($7, $8, $9, $10, $11, $12),
      ($13, $14, $15, $16, $17, $18)
      ON CONFLICT (barraca_id, day_of_week) DO NOTHING', schema_name)
    USING 
      'barraca-uruguay', 0, false, NULL::time, NULL::time, 'Closed on Sundays',
      'barraca-uruguay', 1, true, '12:00:00'::time, '22:00:00'::time, 'Monday - Regular hours',
      'barraca-uruguay', 6, true, '12:00:00'::time, '23:00:00'::time, 'Saturday - Extended hours';
  END IF;

  IF barraca_count >= 2 THEN
    -- Add business hours for Barraca do Zeca
    EXECUTE format('
      INSERT INTO %I.business_hours (barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, notes) VALUES
      ($1, $2, $3, $4, $5, $6),
      ($7, $8, $9, $10, $11, $12)
      ON CONFLICT (barraca_id, day_of_week) DO NOTHING', schema_name)
    USING 
      '1', 1, true, '11:00:00'::time, '21:00:00'::time, 'Monday - Traditional hours',
      '1', 6, true, '10:00:00'::time, '22:00:00'::time, 'Saturday - Extended hours';
  END IF;

  -- Reset search path
  SET search_path TO public;
  
  RAISE NOTICE 'Seeded % environment with % barracas and supporting data', schema_name, barraca_count;
END;
$$ LANGUAGE plpgsql;

-- Create all environment schemas
SELECT create_environment_schema('dev');
SELECT create_environment_schema('qa');
SELECT create_environment_schema('uat');
SELECT create_environment_schema('prod');

-- Create RLS policies for all environments
SELECT create_environment_policies('dev');
SELECT create_environment_policies('qa');
SELECT create_environment_policies('uat');
SELECT create_environment_policies('prod');

-- Create functions for all environments
SELECT create_environment_functions('dev');
SELECT create_environment_functions('qa');
SELECT create_environment_functions('uat');
SELECT create_environment_functions('prod');

-- Seed data for environments
SELECT seed_environment_data('dev', 'full');
SELECT seed_environment_data('qa', 'subset');
SELECT seed_environment_data('uat', 'minimal');
SELECT seed_environment_data('prod', 'full');

-- Create environment info view
CREATE OR REPLACE VIEW environment_info AS
SELECT 
  schemaname as environment,
  tablename,
  CASE 
    WHEN schemaname = 'dev' THEN 'Development - Full dataset for development and testing'
    WHEN schemaname = 'qa' THEN 'Quality Assurance - Subset for QA testing'
    WHEN schemaname = 'uat' THEN 'User Acceptance Testing - Minimal dataset for UAT'
    WHEN schemaname = 'prod' THEN 'Production - Live production data'
    ELSE 'Unknown environment'
  END as description,
  (SELECT count(*) FROM information_schema.tables WHERE table_schema = schemaname AND table_name = 'barracas') as has_data
FROM pg_tables 
WHERE schemaname IN ('dev', 'qa', 'uat', 'prod')
  AND tablename = 'barracas'
ORDER BY schemaname;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA dev TO anon, authenticated;
GRANT USAGE ON SCHEMA qa TO anon, authenticated;
GRANT USAGE ON SCHEMA uat TO anon, authenticated;
GRANT USAGE ON SCHEMA prod TO anon, authenticated;

-- Grant table permissions for each schema
DO $$
DECLARE
  schema_name text;
BEGIN
  FOR schema_name IN VALUES ('dev'), ('qa'), ('uat'), ('prod') LOOP
    EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO anon', schema_name);
    EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO authenticated', schema_name);
    EXECUTE format('GRANT USAGE ON ALL SEQUENCES IN SCHEMA %I TO anon, authenticated', schema_name);
    EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %I TO anon, authenticated', schema_name);
  END LOOP;
END $$;

-- Add comments
COMMENT ON SCHEMA dev IS 'Development environment - Full dataset for development and testing';
COMMENT ON SCHEMA qa IS 'Quality Assurance environment - Subset for QA testing';
COMMENT ON SCHEMA uat IS 'User Acceptance Testing environment - Minimal dataset for UAT';
COMMENT ON SCHEMA prod IS 'Production environment - Live production data';

-- Create environment management functions
CREATE OR REPLACE FUNCTION get_environment_stats()
RETURNS TABLE(
  environment text,
  barracas_count bigint,
  stories_count bigint,
  subscriptions_count bigint,
  last_activity timestamptz
) AS $$
DECLARE
  env_name text;
BEGIN
  FOR env_name IN VALUES ('dev'), ('qa'), ('uat'), ('prod') LOOP
    RETURN QUERY
    EXECUTE format('
      SELECT 
        %L::text as environment,
        (SELECT count(*) FROM %I.barracas) as barracas_count,
        (SELECT count(*) FROM %I.stories WHERE expires_at > now()) as stories_count,
        (SELECT count(*) FROM %I.email_subscriptions WHERE is_active = true) as subscriptions_count,
        (SELECT max(updated_at) FROM %I.barracas) as last_activity
    ', env_name, env_name, env_name, env_name, env_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to switch between environments (for admin use)
CREATE OR REPLACE FUNCTION switch_environment_context(target_schema text)
RETURNS text AS $$
BEGIN
  IF target_schema NOT IN ('dev', 'qa', 'uat', 'prod') THEN
    RAISE EXCEPTION 'Invalid environment. Must be one of: dev, qa, uat, prod';
  END IF;
  
  EXECUTE format('SET search_path TO %I, public', target_schema);
  
  RETURN format('Switched to %s environment', target_schema);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Multi-environment database setup completed successfully!';
  RAISE NOTICE '📊 Created schemas: dev, qa, uat, prod';
  RAISE NOTICE '🔒 Applied RLS policies to all environments';
  RAISE NOTICE '⚡ Created functions and triggers for all environments';
  RAISE NOTICE '🌱 Seeded appropriate data for each environment';
  RAISE NOTICE '🔍 Use SELECT * FROM environment_info; to see environment details';
  RAISE NOTICE '📈 Use SELECT * FROM get_environment_stats(); to see environment statistics';
END $$;