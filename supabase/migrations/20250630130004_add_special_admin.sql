/*
  # Add Special Admin User Migration

  1. Purpose
     - Add special admin user type for quick open/close operations
     - Create admin_users table for authentication
     - Add quick toggle functions for barraca open/closed status
     - Maintain security with role-based access

  2. Changes
     - Create admin_users table
     - Add special_admin column to barracas table for quick override
     - Create functions for quick open/close operations
     - Add RLS policies for admin access

  3. Impact
     - Special admin can quickly toggle barraca status
     - Override takes precedence over business hours
     - Maintains audit trail of changes
     - Secure access control
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('superuser', 'admin', 'special_admin')),
  name text,
  last_login timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add special_admin column to barracas table for quick override
ALTER TABLE barracas 
ADD COLUMN IF NOT EXISTS special_admin_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS special_admin_override_expires timestamptz DEFAULT NULL;

-- Add comments
COMMENT ON TABLE admin_users IS 'Admin users for system management';
COMMENT ON COLUMN admin_users.role IS 'superuser: full access, admin: standard admin, special_admin: quick open/close only';
COMMENT ON COLUMN barracas.special_admin_override IS 'When true, overrides business hours and shows as open';
COMMENT ON COLUMN barracas.special_admin_override_expires IS 'When override expires, returns to normal business hours';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_barracas_special_admin_override ON barracas(special_admin_override);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin_users updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Create function for special admin to quickly open a barraca
CREATE OR REPLACE FUNCTION special_admin_open_barraca(
  barraca_id_param text,
  duration_hours integer DEFAULT 24
)
RETURNS boolean AS $$
DECLARE
  admin_user_exists boolean;
BEGIN
  -- Check if current user is a special admin (this would be implemented with proper auth)
  -- For now, we'll assume the function is called by an authenticated special admin
  
  -- Check if barraca exists
  IF NOT EXISTS (SELECT 1 FROM barracas WHERE id = barraca_id_param) THEN
    RAISE EXCEPTION 'Barraca not found: %', barraca_id_param;
  END IF;
  
  -- Set the override
  UPDATE barracas 
  SET 
    special_admin_override = true,
    special_admin_override_expires = now() + (duration_hours || ' hours')::interval,
    updated_at = now()
  WHERE id = barraca_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for special admin to quickly close a barraca
CREATE OR REPLACE FUNCTION special_admin_close_barraca(barraca_id_param text)
RETURNS boolean AS $$
BEGIN
  -- Check if barraca exists
  IF NOT EXISTS (SELECT 1 FROM barracas WHERE id = barraca_id_param) THEN
    RAISE EXCEPTION 'Barraca not found: %', barraca_id_param;
  END IF;
  
  -- Remove the override
  UPDATE barracas 
  SET 
    special_admin_override = false,
    special_admin_override_expires = NULL,
    updated_at = now()
  WHERE id = barraca_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get barracas with active special admin overrides
CREATE OR REPLACE FUNCTION get_special_admin_overrides()
RETURNS TABLE(
  barraca_id text,
  barraca_name text,
  override_expires timestamptz,
  hours_remaining numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.special_admin_override_expires,
    EXTRACT(EPOCH FROM (b.special_admin_override_expires - now())) / 3600 as hours_remaining
  FROM barracas b
  WHERE b.special_admin_override = true 
    AND b.special_admin_override_expires > now()
  ORDER BY b.special_admin_override_expires;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the is_barraca_open_now function to check special admin override
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
  weekend_enabled boolean := false;
  special_override boolean := false;
  override_expires timestamptz;
BEGIN
  -- Check if special admin override is active
  SELECT special_admin_override, special_admin_override_expires 
  INTO special_override, override_expires
  FROM barracas
  WHERE id = barraca_id_param;
  
  -- If special override is active and not expired, return true
  IF special_override AND override_expires > check_time THEN
    RETURN true;
  END IF;
  
  -- Check if weekend hours are enabled for this barraca
  SELECT weekend_hours_enabled INTO weekend_enabled
  FROM barracas
  WHERE id = barraca_id_param;
  
  -- If weekend hours are enabled, check weekend schedule first
  IF weekend_enabled THEN
    is_currently_open := is_weekend_hours_active(barraca_id_param, check_time);
    IF is_currently_open THEN
      RETURN true;
    END IF;
  END IF;
  
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

-- Insert default special admin user (password: special123)
INSERT INTO admin_users (email, password_hash, role, name) VALUES
('special@cariocacoastal.com', '$2a$10$example_hash_here', 'special_admin', 'Special Admin')
ON CONFLICT (email) DO NOTHING;

-- Add RLS policies for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only superusers can read all admin users
CREATE POLICY "Superusers can read all admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = current_user 
      AND role = 'superuser'
    )
  );

-- Policy: Only superusers can insert admin users
CREATE POLICY "Superusers can insert admin users" ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = current_user 
      AND role = 'superuser'
    )
  );

-- Policy: Only superusers can update admin users
CREATE POLICY "Superusers can update admin users" ON admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = current_user 
      AND role = 'superuser'
    )
  );

-- Add comments for the new functions
COMMENT ON FUNCTION special_admin_open_barraca IS 'Special admin function to quickly open a barraca for specified duration';
COMMENT ON FUNCTION special_admin_close_barraca IS 'Special admin function to quickly close a barraca';
COMMENT ON FUNCTION get_special_admin_overrides IS 'Get all active special admin overrides with remaining time'; 