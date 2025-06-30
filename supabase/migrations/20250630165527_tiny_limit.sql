/*
  # Fix Weather Cache RLS Policies

  1. Security
    - Drop all existing policies on weather_cache table
    - Add public read access for weather cache
    - Add public insert access for weather cache
    - Add authenticated user full access for weather cache management

  This fixes the RLS policy violations that were preventing weather data caching.
*/

-- Drop all existing policies on weather_cache table
DROP POLICY IF EXISTS "Public can read weather cache" ON weather_cache;
DROP POLICY IF EXISTS "Public can insert weather cache" ON weather_cache;
DROP POLICY IF EXISTS "Authenticated users can manage weather cache" ON weather_cache;

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

-- Allow authenticated users full access to manage weather cache
CREATE POLICY "Authenticated users can manage weather cache"
  ON weather_cache
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);