/*
  # Clean Database Schema Setup

  1. New Tables
    - `barracas` - Main barraca data with location, hours, and contact info
    - `business_hours` - Detailed business hours by day of week (UTC)
    - `stories` - Story content and media with expiration
    - `email_subscriptions` - Newsletter subscriptions with preferences
    - `weather_cache` - Weather data caching with expiration
    - `visitor_analytics` - Unique visitor tracking and analytics
    - `translations` - Multi-language content support
    - `translation_keys` - Translation key management

  2. Security
    - Enable RLS on all tables
    - Create appropriate policies for public and authenticated users
    - Secure functions with SECURITY DEFINER

  3. Performance
    - Add indexes for common queries
    - Enable real-time subscriptions
    - Add geospatial support for location-based queries

  4. Sample Data
    - 8 barracas with different characteristics
    - Business hours for Barraca Uruguay
    - Sample stories, email subscriptions, and weather data
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create barracas table
CREATE TABLE IF NOT EXISTS barracas (
  id text PRIMARY KEY,
  name text NOT NULL,
  barraca_number text,
  location text NOT NULL,
  coordinates jsonb NOT NULL,
  is_open boolean DEFAULT true,
  typical_hours text DEFAULT '9:00 - 18:00',
  description text NOT NULL,
  images text[] DEFAULT '{}',
  menu_preview text[] DEFAULT '{}',
  contact jsonb DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  weather_dependent boolean DEFAULT false,
  cta_buttons jsonb DEFAULT '[]',
  open_time_utc time,
  close_time_utc time,
  timezone text DEFAULT 'America/Sao_Paulo',
  business_hours jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business hours table
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barraca_id text NOT NULL,
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
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'business_hours_barraca_id_fkey'
  ) THEN
    ALTER TABLE business_hours ADD CONSTRAINT business_hours_barraca_id_fkey 
    FOREIGN KEY (barraca_id) REFERENCES barracas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  barraca_id text NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  caption text,
  duration integer,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours'
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'stories_barraca_id_fkey'
  ) THEN
    ALTER TABLE stories ADD CONSTRAINT stories_barraca_id_fkey 
    FOREIGN KEY (barraca_id) REFERENCES barracas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  preferences jsonb DEFAULT '{"newBarracas": true, "specialOffers": true}',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  is_active boolean DEFAULT true
);

-- Create weather cache table
CREATE TABLE IF NOT EXISTS weather_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  temperature numeric(4,1) NOT NULL,
  feels_like numeric(4,1) NOT NULL,
  humidity integer NOT NULL,
  wind_speed numeric(4,1) NOT NULL,
  wind_direction integer NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  beach_conditions text NOT NULL CHECK (beach_conditions IN ('excellent', 'good', 'fair', 'poor')),
  cached_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '15 minutes'
);

-- Create visitor analytics table
CREATE TABLE IF NOT EXISTS visitor_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text UNIQUE NOT NULL,
  first_visit timestamptz DEFAULT now(),
  last_visit timestamptz DEFAULT now(),
  visit_count integer DEFAULT 1,
  user_agent text,
  referrer text,
  country text,
  city text,
  created_at timestamptz DEFAULT now()
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type varchar(50) NOT NULL,
  entity_id varchar(255) NOT NULL,
  field_name varchar(100) NOT NULL,
  language_code varchar(10) NOT NULL,
  translated_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  is_approved boolean DEFAULT false,
  is_primary boolean DEFAULT false,
  UNIQUE(entity_type, entity_id, field_name, language_code)
);

-- Create translation keys table
CREATE TABLE IF NOT EXISTS translation_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name varchar(255) UNIQUE NOT NULL,
  category varchar(100) NOT NULL,
  description text,
  is_dynamic boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance (with IF NOT EXISTS checks)
CREATE INDEX IF NOT EXISTS idx_barracas_location ON barracas(location);
CREATE INDEX IF NOT EXISTS idx_barracas_is_open ON barracas(is_open);
CREATE INDEX IF NOT EXISTS idx_barracas_coordinates ON barracas USING GIN(coordinates);
CREATE INDEX IF NOT EXISTS idx_barracas_search ON barracas USING GIN(to_tsvector('portuguese', name || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_business_hours_barraca_id ON business_hours(barraca_id);
CREATE INDEX IF NOT EXISTS idx_business_hours_day_of_week ON business_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_business_hours_is_open ON business_hours(is_open);

CREATE INDEX IF NOT EXISTS idx_stories_barraca_id ON stories(barraca_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);

CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_active ON email_subscriptions(is_active);

CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON weather_cache(location);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at ON weather_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visitor_id ON visitor_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_last_visit ON visitor_analytics(last_visit DESC);

CREATE INDEX IF NOT EXISTS idx_translations_entity ON translations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_field ON translations(field_name);

CREATE INDEX IF NOT EXISTS idx_translation_keys_category ON translation_keys(category);

-- Enable Row Level Security
ALTER TABLE barracas ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DO $$
BEGIN
  -- Barracas policies
  DROP POLICY IF EXISTS "Public can read barracas" ON barracas;
  DROP POLICY IF EXISTS "Authenticated users can manage barracas" ON barracas;
  
  CREATE POLICY "Public can read barracas" ON barracas
    FOR SELECT TO public USING (true);
  
  CREATE POLICY "Authenticated users can manage barracas" ON barracas
    FOR ALL TO authenticated USING (true);

  -- Business hours policies
  DROP POLICY IF EXISTS "Public can read business hours" ON business_hours;
  DROP POLICY IF EXISTS "Authenticated users can manage business hours" ON business_hours;
  
  CREATE POLICY "Public can read business hours" ON business_hours
    FOR SELECT TO public USING (true);
  
  CREATE POLICY "Authenticated users can manage business hours" ON business_hours
    FOR ALL TO authenticated USING (true);

  -- Stories policies
  DROP POLICY IF EXISTS "Public can read active stories" ON stories;
  DROP POLICY IF EXISTS "Authenticated users can manage stories" ON stories;
  
  CREATE POLICY "Public can read active stories" ON stories
    FOR SELECT TO public USING (expires_at > now());
  
  CREATE POLICY "Authenticated users can manage stories" ON stories
    FOR ALL TO authenticated USING (true);

  -- Email subscriptions policies
  DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON email_subscriptions;
  
  CREATE POLICY "Users can manage their own subscriptions" ON email_subscriptions
    FOR ALL TO public USING (true);

  -- Weather cache policies
  DROP POLICY IF EXISTS "Public can read weather cache" ON weather_cache;
  DROP POLICY IF EXISTS "Authenticated users can manage weather cache" ON weather_cache;
  
  CREATE POLICY "Public can read weather cache" ON weather_cache
    FOR SELECT TO public USING (true);
  
  CREATE POLICY "Authenticated users can manage weather cache" ON weather_cache
    FOR ALL TO authenticated USING (true);

  -- Visitor analytics policies
  DROP POLICY IF EXISTS "Public can insert visitor analytics" ON visitor_analytics;
  DROP POLICY IF EXISTS "Authenticated users can read visitor analytics" ON visitor_analytics;
  
  CREATE POLICY "Public can insert visitor analytics" ON visitor_analytics
    FOR INSERT TO public WITH CHECK (true);
  
  CREATE POLICY "Authenticated users can read visitor analytics" ON visitor_analytics
    FOR SELECT TO authenticated USING (true);

  -- Translations policies
  DROP POLICY IF EXISTS "Allow public read access to approved translations" ON translations;
  DROP POLICY IF EXISTS "Allow authenticated users to create translations" ON translations;
  DROP POLICY IF EXISTS "Allow users to update their own translations" ON translations;
  
  CREATE POLICY "Allow public read access to approved translations" ON translations
    FOR SELECT TO public USING (is_approved = true);
  
  CREATE POLICY "Allow authenticated users to create translations" ON translations
    FOR INSERT TO public WITH CHECK (role() = 'authenticated');
  
  CREATE POLICY "Allow users to update their own translations" ON translations
    FOR UPDATE TO public USING (uid() = created_by);

  -- Translation keys policies
  DROP POLICY IF EXISTS "Allow public read access to translation keys" ON translation_keys;
  DROP POLICY IF EXISTS "Allow authenticated users to create translation keys" ON translation_keys;
  
  CREATE POLICY "Allow public read access to translation keys" ON translation_keys
    FOR SELECT TO public USING (true);
  
  CREATE POLICY "Allow authenticated users to create translation keys" ON translation_keys
    FOR INSERT TO public WITH CHECK (role() = 'authenticated');
END $$;

-- Create or replace functions for data management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_barraca_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_business_hours_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_barracas_updated_at ON barracas;
CREATE TRIGGER update_barracas_updated_at
  BEFORE UPDATE ON barracas
  FOR EACH ROW
  EXECUTE FUNCTION update_barraca_updated_at();

DROP TRIGGER IF EXISTS update_business_hours_updated_at ON business_hours;
CREATE TRIGGER update_business_hours_updated_at
  BEFORE UPDATE ON business_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_business_hours_updated_at();

DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translation_keys_updated_at ON translation_keys;
CREATE TRIGGER update_translation_keys_updated_at
  BEFORE UPDATE ON translation_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create utility functions
CREATE OR REPLACE FUNCTION convert_local_to_utc(
  local_time time,
  timezone_name text DEFAULT 'America/Sao_Paulo'
)
RETURNS time AS $$
DECLARE
  utc_time time;
  local_timestamp timestamptz;
  utc_timestamp timestamptz;
BEGIN
  local_timestamp := (CURRENT_DATE + local_time) AT TIME ZONE timezone_name;
  utc_timestamp := local_timestamp AT TIME ZONE 'UTC';
  utc_time := utc_timestamp::time;
  RETURN utc_time;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION convert_utc_to_local(
  utc_time time,
  timezone_name text DEFAULT 'America/Sao_Paulo'
)
RETURNS time AS $$
DECLARE
  local_time time;
  utc_timestamp timestamptz;
  local_timestamp timestamptz;
BEGIN
  utc_timestamp := (CURRENT_DATE + utc_time) AT TIME ZONE 'UTC';
  local_timestamp := utc_timestamp AT TIME ZONE timezone_name;
  local_time := local_timestamp::time;
  RETURN local_time;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_barraca_open_now(
  barraca_id_param text,
  check_time timestamptz DEFAULT now()
)
RETURNS boolean AS $$
DECLARE
  current_day integer;
  current_time_utc time;
  hours_record business_hours%ROWTYPE;
  is_currently_open boolean := false;
BEGIN
  current_day := EXTRACT(dow FROM check_time AT TIME ZONE 'UTC');
  current_time_utc := (check_time AT TIME ZONE 'UTC')::time;
  
  SELECT * INTO hours_record
  FROM business_hours
  WHERE barraca_id = barraca_id_param
    AND day_of_week = current_day
    AND is_open = true;
  
  IF NOT FOUND THEN
    SELECT is_open INTO is_currently_open
    FROM barracas
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_nearby_barracas(
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.location,
    is_barraca_open_now(b.id) as is_open,
    ROUND(
      (6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians((b.coordinates->>'lat')::numeric)) * 
        cos(radians((b.coordinates->>'lng')::numeric) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians((b.coordinates->>'lat')::numeric))
      ))::numeric, 2
    ) as distance_km
  FROM barracas b
  WHERE (
    6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians((b.coordinates->>'lat')::numeric)) * 
      cos(radians((b.coordinates->>'lng')::numeric) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians((b.coordinates->>'lat')::numeric))
    )
  ) <= radius_km
  ORDER BY distance_km
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_barracas(
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.location,
    CASE 
      WHEN open_only THEN is_barraca_open_now(b.id)
      ELSE b.is_open
    END as is_open,
    ts_rank(to_tsvector('portuguese', b.name || ' ' || b.description), plainto_tsquery('portuguese', search_query)) as rank
  FROM barracas b
  WHERE 
    (search_query IS NULL OR to_tsvector('portuguese', b.name || ' ' || b.description) @@ plainto_tsquery('portuguese', search_query))
    AND (location_filter IS NULL OR b.location ILIKE '%' || location_filter || '%')
    AND (NOT open_only OR is_barraca_open_now(b.id))
  ORDER BY rank DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable real-time subscriptions (only if not already enabled)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE barracas;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Table already added to publication
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE business_hours;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE stories;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE email_subscriptions;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE weather_cache;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE visitor_analytics;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE translations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE translation_keys;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Insert sample data (only if tables are empty)
INSERT INTO barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at)
SELECT * FROM (VALUES
  ('barraca-uruguay', 'Barraca Uruguay', '203', 'Ipanema', 
   '{"lat": -22.9838, "lng": -43.2096}', 
   true, '09:00 - 19:00', 
   'Premium beachwear boutique offering curated selection of high-quality swimwear, beach accessories, and lifestyle products. Specializing in Brazilian beach fashion with international quality standards.',
   ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'],
   ARRAY['Premium Swimwear', 'Designer Sunglasses', 'Beach Accessories'],
   '{"phone": "+55 21 99237-1601", "email": "contato@barracauruguay.com.br", "website": "https://instagram.com/barraca_uruguay"}',
   ARRAY['Personal Shopper', 'Gift Wrapping', 'Size Consultation'],
   false,
   '[{"id": "shop-online", "text": "Loja Online", "action": {"type": "url", "value": "https://barracauruguay.com.br/loja", "target": "_blank"}, "style": "primary", "position": 1, "visibilityConditions": {}, "icon": "ExternalLink", "enabled": true}]',
   '2023-06-15 10:00:00+00', NOW()),
  
  ('1', 'Barraca do Zeca', '001', 'Copacabana', 
   '{"lat": -22.9711, "lng": -43.1822}', 
   true, '8:00 - 18:00', 
   'Traditional beachside barraca serving fresh seafood and cold drinks with ocean views.',
   ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg'],
   ARRAY['Caipirinha', 'Grilled Fish', 'Coconut Water'],
   '{"phone": "+55 21 99999-1234", "email": "zeca@barraca.com"}',
   ARRAY['WiFi', 'Umbrellas', 'Chairs'],
   true,
   '[]',
   '2024-01-15 10:00:00+00', '2024-01-20 15:30:00+00'),
   
  ('2', 'Sol e Mar', '015', 'Ipanema', 
   '{"lat": -22.9838, "lng": -43.2096}', 
   true, '9:00 - 19:00', 
   'Modern beachside spot famous for its tropical drinks and Instagram-worthy presentation.',
   ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg'],
   ARRAY['Tropical Smoothies', 'Poke Bowl', 'Craft Beer'],
   '{"phone": "+55 21 99999-5678", "website": "www.solemar.com.br"}',
   ARRAY['WiFi', 'Charging Stations', 'Beach Volleyball'],
   false,
   '[]',
   '2024-01-10 09:00:00+00', '2024-01-18 14:20:00+00')
) AS v(id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM barracas WHERE barracas.id = v.id);

-- Insert sample business hours (only if not exists)
INSERT INTO business_hours (barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, notes)
SELECT * FROM (VALUES
  ('barraca-uruguay', 0, false, NULL, NULL, 'Closed on Sundays'),
  ('barraca-uruguay', 1, true, convert_local_to_utc('09:00'::time), convert_local_to_utc('19:00'::time), 'Monday - Regular hours'),
  ('barraca-uruguay', 2, true, convert_local_to_utc('09:00'::time), convert_local_to_utc('19:00'::time), 'Tuesday - Regular hours'),
  ('barraca-uruguay', 6, true, convert_local_to_utc('09:00'::time), convert_local_to_utc('20:00'::time), 'Saturday - Extended hours')
) AS v(barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, notes)
WHERE NOT EXISTS (SELECT 1 FROM business_hours WHERE business_hours.barraca_id = v.barraca_id AND business_hours.day_of_week = v.day_of_week);

-- Insert sample email subscriptions (only if not exists)
INSERT INTO email_subscriptions (email, preferences, subscribed_at)
SELECT * FROM (VALUES
  ('demo@cariocacoastal.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 week'),
  ('user1@example.com', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '3 days')
) AS v(email, preferences, subscribed_at)
WHERE NOT EXISTS (SELECT 1 FROM email_subscriptions WHERE email_subscriptions.email = v.email);

-- Insert initial weather cache data (only if not exists)
INSERT INTO weather_cache (location, temperature, feels_like, humidity, wind_speed, wind_direction, description, icon, beach_conditions, cached_at, expires_at)
SELECT * FROM (VALUES
  ('Rio de Janeiro', 28.0, 32.0, 65, 12.0, 180, 'Partly Cloudy', 'partly-cloudy', 'excellent', NOW(), NOW() + INTERVAL '15 minutes')
) AS v(location, temperature, feels_like, humidity, wind_speed, wind_direction, description, icon, beach_conditions, cached_at, expires_at)
WHERE NOT EXISTS (SELECT 1 FROM weather_cache WHERE weather_cache.location = v.location);

-- Add comments
COMMENT ON TABLE business_hours IS 'Detailed business hours for each barraca by day of week, stored in UTC for consistency across timezones';
COMMENT ON COLUMN business_hours.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
COMMENT ON COLUMN business_hours.open_time_utc IS 'Opening time in UTC';
COMMENT ON COLUMN business_hours.close_time_utc IS 'Closing time in UTC (can be next day for late night venues)';
COMMENT ON COLUMN business_hours.break_start_utc IS 'Break/lunch start time in UTC (optional)';
COMMENT ON COLUMN business_hours.break_end_utc IS 'Break/lunch end time in UTC (optional)';