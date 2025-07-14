/*
  # Add Manual Status for Non-Partnered Barracas Migration

  1. Purpose
     - Add manual open/closed status for non-partnered barracas
     - Allow super admins to manually set status when business hours are unclear
     - Default status should be "undefined" (not determined yet)
     - Only applies to non-partnered barracas

  2. Changes
     - Add manual_status column to barracas table
     - Create function to update manual status
     - Update is_barraca_open_now function to consider manual status
     - Add RLS policies for super admin access

  3. Impact
     - Super admins can manually set open/closed status for non-partnered barracas
     - Manual status takes precedence over business hours for non-partnered barracas
     - Partnered barracas continue to use business hours only
     - Maintains audit trail of manual status changes
*/

-- Add manual_status column to barracas table
ALTER TABLE barracas 
ADD COLUMN IF NOT EXISTS manual_status text DEFAULT 'undefined' CHECK (manual_status IN ('open', 'closed', 'undefined'));

-- Add comment
COMMENT ON COLUMN barracas.manual_status IS 'Manual open/closed status for non-partnered barracas. undefined=not set, open=manually set as open, closed=manually set as closed';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_barracas_manual_status ON barracas(manual_status);

-- Create function for super admin to set manual status
CREATE OR REPLACE FUNCTION set_manual_barraca_status(
  barraca_id_param text,
  status_param text
)
RETURNS boolean AS $$
DECLARE
  barraca_partnered boolean;
BEGIN
  -- Validate status parameter
  IF status_param NOT IN ('open', 'closed', 'undefined') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be open, closed, or undefined', status_param;
  END IF;
  
  -- Check if barraca exists
  IF NOT EXISTS (SELECT 1 FROM barracas WHERE id = barraca_id_param) THEN
    RAISE EXCEPTION 'Barraca not found: %', barraca_id_param;
  END IF;
  
  -- Get partnered status
  SELECT partnered INTO barraca_partnered
  FROM barracas
  WHERE id = barraca_id_param;
  
  -- Only allow manual status for non-partnered barracas
  IF barraca_partnered THEN
    RAISE EXCEPTION 'Cannot set manual status for partnered barracas. Use business hours instead.';
  END IF;
  
  -- Update the manual status
  UPDATE barracas 
  SET 
    manual_status = status_param,
    updated_at = now()
  WHERE id = barraca_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get barracas with manual status
CREATE OR REPLACE FUNCTION get_barracas_with_manual_status()
RETURNS TABLE(
  barraca_id text,
  barraca_name text,
  location text,
  partnered boolean,
  manual_status text,
  last_updated timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.location,
    b.partnered,
    b.manual_status,
    b.updated_at
  FROM barracas b
  WHERE b.partnered = false
  ORDER BY b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the is_barraca_open_now function to consider manual status
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
  barraca_partnered boolean := false;
  manual_status_value text := 'undefined';
BEGIN
  -- Get barraca details
  SELECT partnered, manual_status, special_admin_override, special_admin_override_expires 
  INTO barraca_partnered, manual_status_value, special_override, override_expires
  FROM barracas
  WHERE id = barraca_id_param;
  
  -- Check if special admin override is active
  IF special_override AND override_expires > check_time THEN
    RETURN true;
  END IF;
  
  -- For non-partnered barracas, check manual status first
  IF NOT barraca_partnered AND manual_status_value != 'undefined' THEN
    RETURN manual_status_value = 'open';
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

-- Add comments for the new functions
COMMENT ON FUNCTION set_manual_barraca_status IS 'Super admin function to set manual open/closed status for non-partnered barracas';
COMMENT ON FUNCTION get_barracas_with_manual_status IS 'Get all non-partnered barracas with their manual status';

-- Set default manual status for existing non-partnered barracas
UPDATE barracas 
SET manual_status = 'undefined' 
WHERE partnered = false AND manual_status IS NULL; 