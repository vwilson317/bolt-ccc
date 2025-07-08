/*
  # Remove Open Column Migration

  1. Purpose
     - Remove the is_open column from barracas table
     - Update all functions to use is_barraca_open_now() instead
     - Ensure all queries use the dynamic open status based on business hours
     - Update database functions to remove references to the is_open column

  2. Changes
     - Drop is_open column from barracas table
     - Update get_nearby_barracas function
     - Update search_barracas function
     - Remove is_open index
     - Update any other functions that reference is_open

  3. Impact
     - All open status will now be determined dynamically by business hours
     - No more manual open/closed status management
     - Consistent open status across all queries
*/

-- Drop the index on is_open column first
DROP INDEX IF EXISTS idx_barracas_is_open;

-- Drop the is_open column from barracas table
ALTER TABLE barracas DROP COLUMN IF EXISTS is_open;

-- Update the get_nearby_barracas function to always use is_barraca_open_now
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

-- Update the search_barracas function to always use is_barraca_open_now
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
    is_barraca_open_now(b.id) as is_open,
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

-- Update the is_barraca_open_now function to remove the fallback to is_open column
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
  
  -- If no specific hours found, return false (closed)
  IF NOT FOUND THEN
    RETURN false;
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

-- Update the update_weather_dependent_barracas function to remove is_open references
-- Since we're removing the is_open column, this function is no longer needed
-- Weather-dependent barracas will now be handled by the business_hours table
DROP FUNCTION IF EXISTS update_weather_dependent_barracas();

-- Add a comment explaining the change
COMMENT ON FUNCTION is_barraca_open_now IS 'Check if a barraca is currently open based on business hours only (no longer uses is_open column)'; 