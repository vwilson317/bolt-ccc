/*
  # Weather System Migration

  1. Weather Cache Table
    - Creates a weather_cache table for storing weather data
    - Adds indexes for performance optimization
    - Enables Row Level Security with appropriate policies
  
  2. Weather Functions
    - Adds functions for retrieving and processing weather data
    - Implements beach condition calculation algorithm
    - Creates maintenance functions for expired data cleanup
  
  3. Weather-Dependent Barraca Updates
    - Adds function to automatically update weather-dependent barracas
    - Handles location-specific weather conditions
  
  4. Sample Data
    - Inserts sample weather data for testing
*/

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS cleanup_expired_weather();
DROP FUNCTION IF EXISTS update_weather_dependent_barracas();
DROP FUNCTION IF EXISTS get_weather_for_location(TEXT);
DROP FUNCTION IF EXISTS calculate_beach_conditions(NUMERIC, NUMERIC, INTEGER, INTEGER);

-- Create weather_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  temperature NUMERIC(4,1) NOT NULL,
  feels_like NUMERIC(4,1) NOT NULL,
  humidity INTEGER NOT NULL,
  wind_speed NUMERIC(4,1) NOT NULL,
  wind_direction INTEGER NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  beach_conditions TEXT NOT NULL CHECK (beach_conditions IN ('excellent', 'good', 'fair', 'poor')),
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON weather_cache(location);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at ON weather_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public can read weather cache" ON weather_cache;
DROP POLICY IF EXISTS "Authenticated users can manage weather cache" ON weather_cache;

-- Create policies
CREATE POLICY "Public can read weather cache" 
  ON weather_cache
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Authenticated users can manage weather cache" 
  ON weather_cache
  FOR ALL 
  TO authenticated 
  USING (true);

-- Function to get weather for a location
CREATE OR REPLACE FUNCTION get_weather_for_location(location_name TEXT)
RETURNS TABLE (
  id UUID,
  location TEXT,
  temperature NUMERIC(4,1),
  feels_like NUMERIC(4,1),
  humidity INTEGER,
  wind_speed NUMERIC(4,1),
  wind_direction INTEGER,
  description TEXT,
  icon TEXT,
  beach_conditions TEXT,
  cached_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_fresh BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wc.id,
    wc.location,
    wc.temperature,
    wc.feels_like,
    wc.humidity,
    wc.wind_speed,
    wc.wind_direction,
    wc.description,
    wc.icon,
    wc.beach_conditions,
    wc.cached_at,
    wc.expires_at,
    wc.expires_at > NOW() AS is_fresh
  FROM weather_cache wc
  WHERE wc.location = location_name
  ORDER BY wc.cached_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate beach conditions based on weather data
CREATE OR REPLACE FUNCTION calculate_beach_conditions(
  temp NUMERIC,
  wind_speed NUMERIC,
  humidity INTEGER,
  weather_code INTEGER
) RETURNS TEXT AS $$
DECLARE
  conditions TEXT;
BEGIN
  -- Poor conditions
  IF (weather_code >= 200 AND weather_code < 600) THEN 
    RETURN 'poor'; -- Thunderstorm, drizzle, rain
  END IF;
  
  IF (temp < 20 OR temp > 35) THEN 
    RETURN 'poor'; -- Too cold or too hot
  END IF;
  
  IF (wind_speed > 25) THEN 
    RETURN 'poor'; -- Very windy
  END IF;
  
  -- Fair conditions
  IF (weather_code >= 700 AND weather_code < 800) THEN 
    RETURN 'fair'; -- Atmosphere (fog, mist, etc.)
  END IF;
  
  IF (temp < 22 OR temp > 32) THEN 
    RETURN 'fair'; -- Slightly uncomfortable temperature
  END IF;
  
  IF (wind_speed > 20 OR humidity > 85) THEN 
    RETURN 'fair'; -- Windy or very humid
  END IF;
  
  -- Good conditions
  IF (weather_code = 801 OR weather_code = 802) THEN 
    RETURN 'good'; -- Few clouds or scattered clouds
  END IF;
  
  IF (wind_speed > 15) THEN 
    RETURN 'good'; -- Moderately windy
  END IF;
  
  -- Excellent conditions
  IF (weather_code = 800) THEN 
    RETURN 'excellent'; -- Clear sky
  END IF;
  
  IF (temp >= 24 AND temp <= 30 AND wind_speed <= 15 AND humidity <= 70) THEN
    RETURN 'excellent';
  END IF;
  
  RETURN 'good'; -- Default
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired weather cache
CREATE OR REPLACE FUNCTION cleanup_expired_weather() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM weather_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update weather-dependent barracas based on conditions
CREATE OR REPLACE FUNCTION update_weather_dependent_barracas() RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  current_weather RECORD;
  location_name TEXT;
  total_updated INTEGER := 0;
BEGIN
  -- Get distinct locations with barracas
  FOR location_name IN 
    SELECT DISTINCT location FROM barracas
    WHERE weather_dependent = true
  LOOP
    -- Get latest weather for this location
    SELECT * INTO current_weather 
    FROM get_weather_for_location(location_name)
    WHERE is_fresh = true
    LIMIT 1;
    
    -- If we have fresh weather data
    IF FOUND THEN
      -- Update barracas based on weather conditions
      UPDATE barracas
      SET 
        is_open = CASE 
          WHEN current_weather.beach_conditions IN ('excellent', 'good') THEN true
          WHEN current_weather.beach_conditions IN ('fair', 'poor') THEN false
          ELSE is_open -- Keep current status if no valid condition
        END,
        updated_at = NOW()
      WHERE 
        location = location_name
        AND weather_dependent = true;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      total_updated := total_updated + updated_count;
    END IF;
  END LOOP;
  
  RETURN total_updated;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample weather data for testing (optional)
DO $$
BEGIN
  -- Only insert if the table is empty
  IF NOT EXISTS (SELECT 1 FROM weather_cache LIMIT 1) THEN
    INSERT INTO weather_cache (
      location, 
      temperature, 
      feels_like, 
      humidity, 
      wind_speed, 
      wind_direction, 
      description, 
      icon, 
      beach_conditions
    ) VALUES 
    ('Copacabana', 28.0, 32.0, 65, 12.0, 180, 'Partly Cloudy', 'partly-cloudy', 'excellent'),
    ('Ipanema', 26.0, 30.0, 70, 8.0, 160, 'Sunny', 'sunny', 'good'),
    ('Leblon', 27.0, 31.0, 68, 10.0, 170, 'Clear', 'clear', 'excellent');
  END IF;
END $$;

-- Note: Scheduled jobs for automatic cleanup would typically be handled by:
-- 1. Application-level cron jobs
-- 2. External schedulers (like GitHub Actions, Vercel Cron, etc.)
-- 3. Database triggers on INSERT/UPDATE
-- 
-- For now, cleanup can be called manually or via application logic:
-- SELECT cleanup_expired_weather();
-- SELECT update_weather_dependent_barracas();