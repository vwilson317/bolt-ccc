/*
  # Add Weekend Hours Migration

  1. Purpose
     - Add weekend-only hours support to business_hours table
     - Allow barracas to have special weekend schedules (Friday, Saturday, Sunday)
     - Maintain backward compatibility with existing daily schedules

  2. Changes
     - Add weekend_hours_schedule column to business_hours table
     - Add weekend_hours_enabled column to barracas table
     - Update is_barraca_open_now function to handle weekend schedules
     - Add helper functions for weekend hours management

  3. Impact
     - Barracas can now have weekend-only schedules
     - Weekend schedules override daily schedules when enabled
     - Maintains existing functionality for barracas without weekend schedules
*/

-- Add weekend hours support to business_hours table
ALTER TABLE business_hours 
ADD COLUMN IF NOT EXISTS weekend_hours_schedule jsonb DEFAULT NULL;

-- Add weekend hours enabled flag to barracas table
ALTER TABLE barracas 
ADD COLUMN IF NOT EXISTS weekend_hours_enabled boolean DEFAULT false;

-- Add comment explaining the new column
COMMENT ON COLUMN business_hours.weekend_hours_schedule IS 'JSON object containing weekend hours schedule: {"friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "10:00", "close": "19:00"}, "sunday": {"open": "11:00", "close": "17:00"}}';
COMMENT ON COLUMN barracas.weekend_hours_enabled IS 'When true, weekend_hours_schedule from business_hours overrides daily schedules for Friday, Saturday, Sunday';

-- Create function to check if current time is within weekend hours
CREATE OR REPLACE FUNCTION is_weekend_hours_active(
  barraca_id_param text,
  check_time timestamptz DEFAULT now()
)
RETURNS boolean AS $$
DECLARE
  current_day integer;
  current_time_utc time;
  weekend_schedule jsonb;
  day_name text;
  day_schedule jsonb;
  open_time_str text;
  close_time_str text;
  open_time_utc time;
  close_time_utc time;
  is_currently_open boolean := false;
BEGIN
  -- Get current day of week (0 = Sunday, 5 = Friday, 6 = Saturday)
  current_day := EXTRACT(dow FROM check_time AT TIME ZONE 'UTC');
  
  -- Only check weekend hours for Friday (5), Saturday (6), Sunday (0)
  IF current_day NOT IN (0, 5, 6) THEN
    RETURN false;
  END IF;
  
  -- Get current time in UTC
  current_time_utc := (check_time AT TIME ZONE 'UTC')::time;
  
  -- Get weekend hours schedule from business_hours
  SELECT weekend_hours_schedule INTO weekend_schedule
  FROM business_hours
  WHERE barraca_id = barraca_id_param
    AND day_of_week = current_day
    AND is_open = true;
  
  -- If no weekend schedule found, return false
  IF weekend_schedule IS NULL THEN
    RETURN false;
  END IF;
  
  -- Map day number to day name
  CASE current_day
    WHEN 0 THEN day_name := 'sunday';
    WHEN 5 THEN day_name := 'friday';
    WHEN 6 THEN day_name := 'saturday';
    ELSE RETURN false;
  END CASE;
  
  -- Get schedule for current day
  day_schedule := weekend_schedule->day_name;
  
  -- If no schedule for this day, return false
  IF day_schedule IS NULL THEN
    RETURN false;
  END IF;
  
  -- Extract open and close times
  open_time_str := day_schedule->>'open';
  close_time_str := day_schedule->>'close';
  
  -- If times are not set, return false
  IF open_time_str IS NULL OR close_time_str IS NULL THEN
    RETURN false;
  END IF;
  
  -- Convert times to UTC (assuming times are in local timezone)
  open_time_utc := convert_local_to_utc(open_time_str::time);
  close_time_utc := convert_local_to_utc(close_time_str::time);
  
  -- Check if current time is within business hours
  IF open_time_utc <= close_time_utc THEN
    -- Same-day hours
    is_currently_open := current_time_utc >= open_time_utc AND current_time_utc <= close_time_utc;
  ELSE
    -- Overnight hours (e.g., 22:00 - 02:00)
    is_currently_open := current_time_utc >= open_time_utc OR current_time_utc <= close_time_utc;
  END IF;
  
  RETURN is_currently_open;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the is_barraca_open_now function to check weekend hours first
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
BEGIN
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

-- Create function to set weekend hours for a barraca
CREATE OR REPLACE FUNCTION set_weekend_hours(
  barraca_id_param text,
  friday_open text DEFAULT NULL,
  friday_close text DEFAULT NULL,
  saturday_open text DEFAULT NULL,
  saturday_close text DEFAULT NULL,
  sunday_open text DEFAULT NULL,
  sunday_close text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  weekend_schedule jsonb;
  day_record business_hours%ROWTYPE;
BEGIN
  -- Build weekend schedule JSON
  weekend_schedule := '{}'::jsonb;
  
  IF friday_open IS NOT NULL AND friday_close IS NOT NULL THEN
    weekend_schedule := weekend_schedule || jsonb_build_object('friday', jsonb_build_object('open', friday_open, 'close', friday_close));
  END IF;
  
  IF saturday_open IS NOT NULL AND saturday_close IS NOT NULL THEN
    weekend_schedule := weekend_schedule || jsonb_build_object('saturday', jsonb_build_object('open', saturday_open, 'close', saturday_close));
  END IF;
  
  IF sunday_open IS NOT NULL AND sunday_close IS NOT NULL THEN
    weekend_schedule := weekend_schedule || jsonb_build_object('sunday', jsonb_build_object('open', sunday_open, 'close', sunday_close));
  END IF;
  
  -- Update or insert business hours records for weekend days
  -- Friday (day 5)
  IF friday_open IS NOT NULL AND friday_close IS NOT NULL THEN
    INSERT INTO business_hours (barraca_id, day_of_week, is_open, weekend_hours_schedule)
    VALUES (barraca_id_param, 5, true, weekend_schedule)
    ON CONFLICT (barraca_id, day_of_week)
    DO UPDATE SET 
      is_open = true,
      weekend_hours_schedule = weekend_schedule,
      updated_at = now();
  END IF;
  
  -- Saturday (day 6)
  IF saturday_open IS NOT NULL AND saturday_close IS NOT NULL THEN
    INSERT INTO business_hours (barraca_id, day_of_week, is_open, weekend_hours_schedule)
    VALUES (barraca_id_param, 6, true, weekend_schedule)
    ON CONFLICT (barraca_id, day_of_week)
    DO UPDATE SET 
      is_open = true,
      weekend_hours_schedule = weekend_schedule,
      updated_at = now();
  END IF;
  
  -- Sunday (day 0)
  IF sunday_open IS NOT NULL AND sunday_close IS NOT NULL THEN
    INSERT INTO business_hours (barraca_id, day_of_week, is_open, weekend_hours_schedule)
    VALUES (barraca_id_param, 0, true, weekend_schedule)
    ON CONFLICT (barraca_id, day_of_week)
    DO UPDATE SET 
      is_open = true,
      weekend_hours_schedule = weekend_schedule,
      updated_at = now();
  END IF;
  
  -- Enable weekend hours for the barraca
  UPDATE barracas 
  SET weekend_hours_enabled = true, updated_at = now()
  WHERE id = barraca_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to disable weekend hours for a barraca
CREATE OR REPLACE FUNCTION disable_weekend_hours(barraca_id_param text)
RETURNS void AS $$
BEGIN
  -- Disable weekend hours for the barraca
  UPDATE barracas 
  SET weekend_hours_enabled = false, updated_at = now()
  WHERE id = barraca_id_param;
  
  -- Remove weekend hours schedule from business_hours
  UPDATE business_hours 
  SET weekend_hours_schedule = NULL, updated_at = now()
  WHERE barraca_id = barraca_id_param 
    AND day_of_week IN (0, 5, 6);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for the new functions
COMMENT ON FUNCTION is_weekend_hours_active IS 'Check if a barraca is currently open based on weekend hours schedule';
COMMENT ON FUNCTION set_weekend_hours IS 'Set weekend hours for a barraca (Friday, Saturday, Sunday)';
COMMENT ON FUNCTION disable_weekend_hours IS 'Disable weekend hours for a barraca and remove weekend schedule'; 