/*
  # Fix Weather Cache RLS Policies

  1. Security Policies
    - Add policy for public read access to weather cache
    - Add policy for public insert access to weather cache
    - This allows the application to cache and retrieve weather data

  2. Changes
    - Enable public SELECT on weather_cache table
    - Enable public INSERT on weather_cache table
    - Weather data is public information, so no user-specific restrictions needed
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read weather cache" ON weather_cache;
DROP POLICY IF EXISTS "Public can insert weather cache" ON weather_cache;

-- Allow public read access to weather cache
CREATE POLICY "Public can read weather cache"
  ON weather_cache
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access to weather cache
CREATE POLICY "Public can insert weather cache"
  ON weather_cache
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Also allow authenticated users full access
CREATE POLICY "Authenticated users can manage weather cache"
  ON weather_cache
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);