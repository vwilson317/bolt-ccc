/*
  # Enhanced Business Hours Schema with UTC Support

  1. New Features
    - UTC-based time storage for global consistency
    - Detailed business hours by day of week
    - Support for lunch breaks and complex schedules
    - Timezone conversion functions
    - Real-time open status checking

  2. New Tables
    - `business_hours` - Detailed scheduling per day
      - Supports different hours per day
      - Break time support
      - UTC storage with timezone conversion

  3. New Functions
    - `convert_local_to_utc()` - Convert local time to UTC
    - `convert_utc_to_local()` - Convert UTC to local time
    - `is_barraca_open_now()` - Real-time open status
    - `get_barraca_hours()` - Get hours in local timezone
    - `update_barraca_hours()` - Update hours with timezone conversion

  4. Enhanced Features
    - Overnight venue support (bars open until 3 AM)
    - Lunch break handling
    - Timezone-aware operations
    - Real-time status updates
*/

-- Add new columns for enhanced hours management
ALTER TABLE barracas 
ADD COLUMN IF NOT EXISTS open_time_utc time,
ADD COLUMN IF NOT EXISTS close_time_utc time,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{}';

-- Create business hours table for more complex scheduling
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barraca_id text NOT NULL REFERENCES barracas(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
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

-- Create indexes for business hours
CREATE INDEX IF NOT EXISTS idx_business_hours_barraca_id ON business_hours(barraca_id);
CREATE INDEX IF NOT EXISTS idx_business_hours_day_of_week ON business_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_business_hours_is_open ON business_hours(is_open);

-- Enable RLS for business hours
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business hours
DO $$
BEGIN
  -- Check if policy already exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'business_hours' AND policyname = 'Public can read business hours'
  ) THEN
    CREATE POLICY "Public can read business hours" ON business_hours
      FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'business_hours' AND policyname = 'Authenticated users can manage business hours'
  ) THEN
    CREATE POLICY "Authenticated users can manage business hours" ON business_hours
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- Function to convert local time to UTC
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
  -- Create a timestamp for today with the local time
  local_timestamp := (CURRENT_DATE + local_time) AT TIME ZONE timezone_name;
  
  -- Convert to UTC
  utc_timestamp := local_timestamp AT TIME ZONE 'UTC';
  
  -- Extract just the time part
  utc_time := utc_timestamp::time;
  
  RETURN utc_time;
END;
$$ LANGUAGE plpgsql;

-- Function to convert UTC time to local time
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
  -- Create a UTC timestamp for today with the UTC time
  utc_timestamp := (CURRENT_DATE + utc_time) AT TIME ZONE 'UTC';
  
  -- Convert to local timezone
  local_timestamp := utc_timestamp AT TIME ZONE timezone_name;
  
  -- Extract just the time part
  local_time := local_timestamp::time;
  
  RETURN local_time;
END;
$$ LANGUAGE plpgsql;

-- Function to check if barraca is currently open
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
  -- Get current day of week (0 = Sunday)
  current_day := EXTRACT(dow FROM check_time AT TIME ZONE 'UTC');
  
  -- Get current time in UTC
  current_time_utc := (check_time AT TIME ZONE 'UTC')::time;
  
  -- Get business hours for current day
  SELECT * INTO hours_record
  FROM business_hours
  WHERE barraca_id = barraca_id_param
    AND day_of_week = current_day
    AND is_open = true;
  
  -- If no specific hours found, check barraca's general status
  IF NOT FOUND THEN
    SELECT is_open INTO is_currently_open
    FROM barracas
    WHERE id = barraca_id_param;
    
    RETURN COALESCE(is_currently_open, false);
  END IF;
  
  -- Check if current time is within business hours
  IF hours_record.open_time_utc IS NOT NULL AND hours_record.close_time_utc IS NOT NULL THEN
    -- Handle same-day hours
    IF hours_record.open_time_utc <= hours_record.close_time_utc THEN
      is_currently_open := current_time_utc >= hours_record.open_time_utc 
                          AND current_time_utc <= hours_record.close_time_utc;
    ELSE
      -- Handle overnight hours (e.g., 22:00 - 02:00)
      is_currently_open := current_time_utc >= hours_record.open_time_utc 
                          OR current_time_utc <= hours_record.close_time_utc;
    END IF;
    
    -- Check if we're in break time
    IF is_currently_open AND hours_record.break_start_utc IS NOT NULL AND hours_record.break_end_utc IS NOT NULL THEN
      IF hours_record.break_start_utc <= hours_record.break_end_utc THEN
        -- Same-day break
        IF current_time_utc >= hours_record.break_start_utc AND current_time_utc <= hours_record.break_end_utc THEN
          is_currently_open := false;
        END IF;
      ELSE
        -- Overnight break
        IF current_time_utc >= hours_record.break_start_utc OR current_time_utc <= hours_record.break_end_utc THEN
          is_currently_open := false;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN is_currently_open;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get barraca hours for a specific day
CREATE OR REPLACE FUNCTION get_barraca_hours(
  barraca_id_param text,
  day_of_week_param integer DEFAULT NULL,
  timezone_name text DEFAULT 'America/Sao_Paulo'
)
RETURNS TABLE(
  day_of_week integer,
  is_open boolean,
  open_time_local time,
  close_time_local time,
  break_start_local time,
  break_end_local time,
  notes text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bh.day_of_week,
    bh.is_open,
    convert_utc_to_local(bh.open_time_utc, timezone_name) as open_time_local,
    convert_utc_to_local(bh.close_time_utc, timezone_name) as close_time_local,
    convert_utc_to_local(bh.break_start_utc, timezone_name) as break_start_local,
    convert_utc_to_local(bh.break_end_utc, timezone_name) as break_end_local,
    bh.notes
  FROM business_hours bh
  WHERE bh.barraca_id = barraca_id_param
    AND (day_of_week_param IS NULL OR bh.day_of_week = day_of_week_param)
  ORDER BY bh.day_of_week;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update barraca hours
CREATE OR REPLACE FUNCTION update_barraca_hours(
  barraca_id_param text,
  day_of_week_param integer,
  is_open_param boolean,
  open_time_local time DEFAULT NULL,
  close_time_local time DEFAULT NULL,
  break_start_local time DEFAULT NULL,
  break_end_local time DEFAULT NULL,
  notes_param text DEFAULT NULL,
  timezone_name text DEFAULT 'America/Sao_Paulo'
)
RETURNS void AS $$
DECLARE
  open_time_utc_param time;
  close_time_utc_param time;
  break_start_utc_param time;
  break_end_utc_param time;
BEGIN
  -- Convert local times to UTC
  IF open_time_local IS NOT NULL THEN
    open_time_utc_param := convert_local_to_utc(open_time_local, timezone_name);
  END IF;
  
  IF close_time_local IS NOT NULL THEN
    close_time_utc_param := convert_local_to_utc(close_time_local, timezone_name);
  END IF;
  
  IF break_start_local IS NOT NULL THEN
    break_start_utc_param := convert_local_to_utc(break_start_local, timezone_name);
  END IF;
  
  IF break_end_local IS NOT NULL THEN
    break_end_utc_param := convert_local_to_utc(break_end_local, timezone_name);
  END IF;
  
  -- Insert or update business hours
  INSERT INTO business_hours (
    barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, 
    break_start_utc, break_end_utc, notes
  )
  VALUES (
    barraca_id_param, day_of_week_param, is_open_param, open_time_utc_param, 
    close_time_utc_param, break_start_utc_param, break_end_utc_param, notes_param
  )
  ON CONFLICT (barraca_id, day_of_week)
  DO UPDATE SET
    is_open = EXCLUDED.is_open,
    open_time_utc = EXCLUDED.open_time_utc,
    close_time_utc = EXCLUDED.close_time_utc,
    break_start_utc = EXCLUDED.break_start_utc,
    break_end_utc = EXCLUDED.break_end_utc,
    notes = EXCLUDED.notes,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing typical_hours data to new format
DO $$
DECLARE
  barraca_record RECORD;
  open_time text;
  close_time text;
  open_time_parsed time;
  close_time_parsed time;
  day_num integer;
BEGIN
  -- Loop through all barracas with typical_hours
  FOR barraca_record IN 
    SELECT id, typical_hours, timezone 
    FROM barracas 
    WHERE typical_hours IS NOT NULL AND typical_hours != ''
  LOOP
    BEGIN
      -- Parse typical hours (format: "9:00 - 18:00" or "09:00 - 19:00")
      IF barraca_record.typical_hours ~ '^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$' THEN
        -- Split the hours
        open_time := trim(split_part(barraca_record.typical_hours, '-', 1));
        close_time := trim(split_part(barraca_record.typical_hours, '-', 2));
        
        -- Parse times
        open_time_parsed := open_time::time;
        close_time_parsed := close_time::time;
        
        -- Convert to UTC and update main table
        UPDATE barracas 
        SET 
          open_time_utc = convert_local_to_utc(open_time_parsed, COALESCE(barraca_record.timezone, 'America/Sao_Paulo')),
          close_time_utc = convert_local_to_utc(close_time_parsed, COALESCE(barraca_record.timezone, 'America/Sao_Paulo'))
        WHERE id = barraca_record.id;
        
        -- Create business hours for all days of the week (Monday-Sunday)
        FOR day_num IN 0..6 LOOP
          INSERT INTO business_hours (
            barraca_id, day_of_week, is_open, open_time_utc, close_time_utc
          )
          VALUES (
            barraca_record.id,
            day_num,
            true,
            convert_local_to_utc(open_time_parsed, COALESCE(barraca_record.timezone, 'America/Sao_Paulo')),
            convert_local_to_utc(close_time_parsed, COALESCE(barraca_record.timezone, 'America/Sao_Paulo'))
          )
          ON CONFLICT (barraca_id, day_of_week) DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Migrated hours for barraca %: % -> % UTC to % UTC', 
          barraca_record.id, 
          barraca_record.typical_hours,
          convert_local_to_utc(open_time_parsed, COALESCE(barraca_record.timezone, 'America/Sao_Paulo')),
          convert_local_to_utc(close_time_parsed, COALESCE(barraca_record.timezone, 'America/Sao_Paulo'));
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Failed to migrate hours for barraca %: %', barraca_record.id, SQLERRM;
        -- Set default hours (9 AM to 6 PM local time)
        UPDATE barracas 
        SET 
          open_time_utc = convert_local_to_utc('09:00'::time, COALESCE(barraca_record.timezone, 'America/Sao_Paulo')),
          close_time_utc = convert_local_to_utc('18:00'::time, COALESCE(barraca_record.timezone, 'America/Sao_Paulo'))
        WHERE id = barraca_record.id;
        
        -- Create default business hours
        FOR day_num IN 0..6 LOOP
          INSERT INTO business_hours (
            barraca_id, day_of_week, is_open, open_time_utc, close_time_utc
          )
          VALUES (
            barraca_record.id,
            day_num,
            true,
            convert_local_to_utc('09:00'::time, COALESCE(barraca_record.timezone, 'America/Sao_Paulo')),
            convert_local_to_utc('18:00'::time, COALESCE(barraca_record.timezone, 'America/Sao_Paulo'))
          )
          ON CONFLICT (barraca_id, day_of_week) DO NOTHING;
        END LOOP;
    END;
  END LOOP;
END $$;

-- Update the search function to use new hours format
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

-- Update the nearby barracas function to include current open status
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

-- Create trigger to update business hours updated_at
CREATE OR REPLACE FUNCTION update_business_hours_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_business_hours_updated_at ON business_hours;
CREATE TRIGGER update_business_hours_updated_at
  BEFORE UPDATE ON business_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_business_hours_updated_at();

-- Enable real-time subscriptions for business hours (only if not already added)
DO $$
BEGIN
  -- Check if table is already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'business_hours'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE business_hours;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Publication might not exist yet, ignore error
    NULL;
END $$;

-- Add some example business hours with different schedules
-- Using ON CONFLICT to avoid duplicates

-- Clear any existing example data first
DELETE FROM business_hours WHERE barraca_id IN ('barraca-uruguay', '5', '4');

-- Barraca Uruguay - Closed Sundays, shorter hours on Saturday
INSERT INTO business_hours (barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, break_start_utc, break_end_utc, notes) VALUES
('barraca-uruguay', 0, false, NULL, NULL, NULL, NULL, 'Closed on Sundays'),
('barraca-uruguay', 1, true, convert_local_to_utc('09:00'::time), convert_local_to_utc('19:00'::time), NULL, NULL, 'Monday - Regular hours'),
('barraca-uruguay', 2, true, convert_local_to_utc('09:00'::time), convert_local_to_utc('19:00'::time), NULL, NULL, 'Tuesday - Regular hours'),
('barraca-uruguay', 3, true, convert_local_to_utc('09:00'::time), convert_local_to_utc('19:00'::time), NULL, NULL, 'Wednesday - Regular hours'),
('barraca-uruguay', 4, true, convert_local_to_utc('09:00'::time), convert_local_to_utc('19:00'::time), NULL, NULL, 'Thursday - Regular hours'),
('barraca-uruguay', 5, true, convert_local_to_utc('09:00'::time), convert_local_to_utc('20:00'::time), NULL, NULL, 'Friday - Extended hours'),
('barraca-uruguay', 6, true, convert_local_to_utc('09:00'::time), convert_local_to_utc('20:00'::time), NULL, NULL, 'Saturday - Extended hours')
ON CONFLICT (barraca_id, day_of_week) DO UPDATE SET
  is_open = EXCLUDED.is_open,
  open_time_utc = EXCLUDED.open_time_utc,
  close_time_utc = EXCLUDED.close_time_utc,
  break_start_utc = EXCLUDED.break_start_utc,
  break_end_utc = EXCLUDED.break_end_utc,
  notes = EXCLUDED.notes,
  updated_at = now();

-- Posto 9 Beach Bar - Late night hours, closed Mondays
INSERT INTO business_hours (barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, break_start_utc, break_end_utc, notes) VALUES
('5', 0, true, convert_local_to_utc('16:00'::time), convert_local_to_utc('02:00'::time), NULL, NULL, 'Sunday - Late night'),
('5', 1, false, NULL, NULL, NULL, NULL, 'Closed on Mondays'),
('5', 2, true, convert_local_to_utc('16:00'::time), convert_local_to_utc('01:00'::time), NULL, NULL, 'Tuesday - Late night'),
('5', 3, true, convert_local_to_utc('16:00'::time), convert_local_to_utc('01:00'::time), NULL, NULL, 'Wednesday - Late night'),
('5', 4, true, convert_local_to_utc('16:00'::time), convert_local_to_utc('02:00'::time), NULL, NULL, 'Thursday - Late night'),
('5', 5, true, convert_local_to_utc('16:00'::time), convert_local_to_utc('03:00'::time), NULL, NULL, 'Friday - Very late'),
('5', 6, true, convert_local_to_utc('16:00'::time), convert_local_to_utc('03:00'::time), NULL, NULL, 'Saturday - Very late')
ON CONFLICT (barraca_id, day_of_week) DO UPDATE SET
  is_open = EXCLUDED.is_open,
  open_time_utc = EXCLUDED.open_time_utc,
  close_time_utc = EXCLUDED.close_time_utc,
  break_start_utc = EXCLUDED.break_start_utc,
  break_end_utc = EXCLUDED.break_end_utc,
  notes = EXCLUDED.notes,
  updated_at = now();

-- Praia Zen - Early morning hours with lunch break
INSERT INTO business_hours (barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, break_start_utc, break_end_utc, notes) VALUES
('4', 0, true, convert_local_to_utc('07:00'::time), convert_local_to_utc('17:00'::time), NULL, NULL, 'Sunday - Wellness day'),
('4', 1, true, convert_local_to_utc('06:00'::time), convert_local_to_utc('17:00'::time), convert_local_to_utc('12:00'::time), convert_local_to_utc('13:00'::time), 'Monday - Early start with lunch break'),
('4', 2, true, convert_local_to_utc('06:00'::time), convert_local_to_utc('17:00'::time), convert_local_to_utc('12:00'::time), convert_local_to_utc('13:00'::time), 'Tuesday - Early start with lunch break'),
('4', 3, true, convert_local_to_utc('06:00'::time), convert_local_to_utc('17:00'::time), convert_local_to_utc('12:00'::time), convert_local_to_utc('13:00'::time), 'Wednesday - Early start with lunch break'),
('4', 4, true, convert_local_to_utc('06:00'::time), convert_local_to_utc('17:00'::time), convert_local_to_utc('12:00'::time), convert_local_to_utc('13:00'::time), 'Thursday - Early start with lunch break'),
('4', 5, true, convert_local_to_utc('06:00'::time), convert_local_to_utc('17:00'::time), convert_local_to_utc('12:00'::time), convert_local_to_utc('13:00'::time), 'Friday - Early start with lunch break'),
('4', 6, true, convert_local_to_utc('07:00'::time), convert_local_to_utc('17:00'::time), NULL, NULL, 'Saturday - Weekend hours')
ON CONFLICT (barraca_id, day_of_week) DO UPDATE SET
  is_open = EXCLUDED.is_open,
  open_time_utc = EXCLUDED.open_time_utc,
  close_time_utc = EXCLUDED.close_time_utc,
  break_start_utc = EXCLUDED.break_start_utc,
  break_end_utc = EXCLUDED.break_end_utc,
  notes = EXCLUDED.notes,
  updated_at = now();

-- Add comment explaining the new schema
COMMENT ON TABLE business_hours IS 'Detailed business hours for each barraca by day of week, stored in UTC for consistency across timezones';
COMMENT ON COLUMN business_hours.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
COMMENT ON COLUMN business_hours.open_time_utc IS 'Opening time in UTC';
COMMENT ON COLUMN business_hours.close_time_utc IS 'Closing time in UTC (can be next day for late night venues)';
COMMENT ON COLUMN business_hours.break_start_utc IS 'Break/lunch start time in UTC (optional)';
COMMENT ON COLUMN business_hours.break_end_utc IS 'Break/lunch end time in UTC (optional)';

COMMENT ON FUNCTION is_barraca_open_now IS 'Check if a barraca is currently open based on current UTC time and business hours';
COMMENT ON FUNCTION get_barraca_hours IS 'Get business hours for a barraca, converted to specified timezone';
COMMENT ON FUNCTION update_barraca_hours IS 'Update business hours for a specific day, converting local time to UTC';