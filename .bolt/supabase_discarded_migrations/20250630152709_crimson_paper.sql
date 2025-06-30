/*
  # Weather Feature Implementation

  1. New Tables
    - `weather_cache` - Stores cached weather data for locations
      - `id` (uuid, primary key)
      - `location` (text, not null)
      - `temperature` (numeric(4,1), not null)
      - `feels_like` (numeric(4,1), not null)
      - `humidity` (integer, not null)
      - `wind_speed` (numeric(4,1), not null)
      - `wind_direction` (integer, not null)
      - `description` (text, not null)
      - `icon` (text, not null)
      - `beach_conditions` (text, not null)
      - `cached_at` (timestamptz, default now())
      - `expires_at` (timestamptz, default now() + 15 minutes)
  
  2. Functions
    - `get_weather_for_location` - Gets weather data for a specific location
    - `calculate_beach_conditions` - Calculates beach conditions based on weather data
    - `cleanup_expired_weather` - Removes expired weather cache entries
  
  3. Security
    - Enable RLS on weather_cache table
    - Add policies for public read access
    - Add policies for authenticated users to manage weather data
*/

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
  WHERE expires_at < NOW()
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update weather-dependent barracas based on conditions
CREATE OR REPLACE FUNCTION update_weather_dependent_barracas() RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  current_weather RECORD;
  location_name TEXT;
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
    END IF;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired weather cache (runs every hour)
-- Note: This requires pg_cron extension which may not be available in all environments
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Only create the job if pg_cron is available
    PERFORM cron.schedule(
      'cleanup-weather-cache',
      '0 * * * *', -- Every hour
      $$SELECT cleanup_expired_weather()$$
    );
    
    PERFORM cron.schedule(
      'update-weather-dependent-barracas',
      '*/15 * * * *', -- Every 15 minutes
      $$SELECT update_weather_dependent_barracas()$$
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron extension not available, skipping scheduled job creation';
END $$;