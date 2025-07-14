/*
  # Weather Override System

  1. New Table
    - `weather_override` - Stores global weather override state
      - `id` (uuid, primary key)
      - `is_active` (boolean) - Whether override is currently active
      - `expires_at` (timestamptz) - When override should automatically clear
      - `created_at` (timestamptz) - When override was created
      - `updated_at` (timestamptz) - When override was last updated

  2. Security
    - Enable RLS on weather_override table
    - Public read access for checking override status
    - Authenticated users can manage override

  3. Functions
    - `get_weather_override()` - Get current override status
    - `set_weather_override()` - Set override status
    - `clear_expired_override()` - Clear expired overrides

  4. Performance
    - Index on is_active for fast status checks
    - Index on expires_at for cleanup operations
*/

-- Create weather_override table
CREATE TABLE IF NOT EXISTS weather_override (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weather_override_is_active ON weather_override(is_active);
CREATE INDEX IF NOT EXISTS idx_weather_override_expires_at ON weather_override(expires_at);

-- Enable Row Level Security
ALTER TABLE weather_override ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read weather override"
  ON weather_override
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage weather override"
  ON weather_override
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to get current weather override status
CREATE OR REPLACE FUNCTION get_weather_override()
RETURNS TABLE (
  is_active BOOLEAN,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wo.is_active,
    wo.expires_at
  FROM weather_override wo
  ORDER BY wo.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set weather override
CREATE OR REPLACE FUNCTION set_weather_override(
  active BOOLEAN,
  expiry TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Clear any existing overrides
  DELETE FROM weather_override;
  
  -- Insert new override
  INSERT INTO weather_override (is_active, expires_at)
  VALUES (active, expiry);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear expired overrides
CREATE OR REPLACE FUNCTION clear_expired_override()
RETURNS INTEGER AS $$
DECLARE
  cleared_count INTEGER;
BEGIN
  UPDATE weather_override 
  SET is_active = false 
  WHERE expires_at IS NOT NULL AND expires_at <= NOW();
  
  GET DIAGNOSTICS cleared_count = ROW_COUNT;
  RETURN cleared_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE TRIGGER update_weather_override_updated_at
  BEFORE UPDATE ON weather_override
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial inactive override
INSERT INTO weather_override (is_active, expires_at) 
VALUES (false, NULL)
ON CONFLICT DO NOTHING;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE weather_override; 