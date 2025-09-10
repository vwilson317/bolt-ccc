/*
  # Update Open Logic and Special Admin Override Expiry

  - Simplify open/closed logic order:
    1) Special admin override
    2) Weekend hours
    3) Normal business hours

  - Set special admin override expiry to 22:00 (10pm) local time (America/Sao_Paulo)
    regardless of requested duration.
*/

-- Update special_admin_open_barraca (UUID variant) to set expiry to 22:00 local
CREATE OR REPLACE FUNCTION special_admin_open_barraca(barraca_id_param UUID, duration_hours INTEGER DEFAULT 24)
RETURNS BOOLEAN AS $$
DECLARE
  local_now TIMESTAMP WITHOUT TIME ZONE;
  expiry_local TIMESTAMP WITHOUT TIME ZONE;
  expiry_at_utc TIMESTAMPTZ;
BEGIN
  -- Validate: barraca exists
  IF NOT EXISTS (SELECT 1 FROM barracas WHERE id = barraca_id_param) THEN
    RAISE EXCEPTION 'Barraca not found: %', barraca_id_param;
  END IF;

  -- Current local time in America/Sao_Paulo
  local_now := (NOW() AT TIME ZONE 'America/Sao_Paulo');

  -- Build today at 22:00 local
  expiry_local := date_trunc('day', local_now) + INTERVAL '22 hours';

  -- If already past 22:00 local, set to 22:00 tomorrow local
  IF local_now >= expiry_local THEN
    expiry_local := (date_trunc('day', local_now) + INTERVAL '1 day') + INTERVAL '22 hours';
  END IF;

  -- Convert local timestamp to timestamptz assuming America/Sao_Paulo local time
  expiry_at_utc := expiry_local AT TIME ZONE 'America/Sao_Paulo';

  UPDATE barracas 
  SET special_admin_override = TRUE,
      special_admin_override_expires = expiry_at_utc,
      updated_at = NOW()
  WHERE id = barraca_id_param;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backward-compatibility: text variant if still referenced anywhere
CREATE OR REPLACE FUNCTION special_admin_open_barraca(barraca_id_param TEXT, duration_hours INTEGER DEFAULT 24)
RETURNS BOOLEAN AS $$
DECLARE
  local_now TIMESTAMP WITHOUT TIME ZONE;
  expiry_local TIMESTAMP WITHOUT TIME ZONE;
  expiry_at_utc TIMESTAMPTZ;
  barraca_uuid UUID;
BEGIN
  -- Attempt to cast text to UUID; will raise if invalid
  barraca_uuid := barraca_id_param::UUID;
  PERFORM special_admin_open_barraca(barraca_uuid, duration_hours);
  RETURN TRUE;
EXCEPTION WHEN invalid_text_representation THEN
  RAISE EXCEPTION 'Invalid UUID for barraca_id_param: %', barraca_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update is_barraca_open_now to follow the simplified order (TEXT variant)
CREATE OR REPLACE FUNCTION is_barraca_open_now(
  barraca_id_param TEXT,
  check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  current_day INTEGER;
  current_time_utc TIME;
  hours_record business_hours%ROWTYPE;
  is_currently_open BOOLEAN := FALSE;
  weekend_enabled BOOLEAN := FALSE;
  special_override BOOLEAN := FALSE;
  override_expires TIMESTAMPTZ;
BEGIN
  -- 1) Special admin override
  SELECT special_admin_override, special_admin_override_expires 
  INTO special_override, override_expires
  FROM barracas
  WHERE id = barraca_id_param;

  IF special_override AND override_expires > check_time THEN
    RETURN TRUE;
  END IF;

  -- 2) Weekend hours first (if enabled)
  SELECT weekend_hours_enabled INTO weekend_enabled
  FROM barracas
  WHERE id = barraca_id_param;

  IF weekend_enabled THEN
    is_currently_open := is_weekend_hours_active(barraca_id_param, check_time);
    IF is_currently_open THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- 3) Normal business hours
  current_day := EXTRACT(dow FROM check_time AT TIME ZONE 'UTC');
  current_time_utc := (check_time AT TIME ZONE 'UTC')::time;

  SELECT * INTO hours_record
  FROM business_hours
  WHERE barraca_id = barraca_id_param
    AND day_of_week = current_day
    AND is_open = TRUE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF hours_record.open_time_utc IS NOT NULL AND hours_record.close_time_utc IS NOT NULL THEN
    IF hours_record.open_time_utc <= hours_record.close_time_utc THEN
      is_currently_open := current_time_utc >= hours_record.open_time_utc 
                          AND current_time_utc <= hours_record.close_time_utc;
    ELSE
      is_currently_open := current_time_utc >= hours_record.open_time_utc 
                          OR current_time_utc <= hours_record.close_time_utc;
    END IF;

    -- Break handling
    IF is_currently_open AND hours_record.break_start_utc IS NOT NULL AND hours_record.break_end_utc IS NOT NULL THEN
      IF hours_record.break_start_utc <= hours_record.break_end_utc THEN
        IF current_time_utc >= hours_record.break_start_utc AND current_time_utc <= hours_record.break_end_utc THEN
          is_currently_open := FALSE;
        END IF;
      ELSE
        IF current_time_utc >= hours_record.break_start_utc OR current_time_utc <= hours_record.break_end_utc THEN
          is_currently_open := FALSE;
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN is_currently_open;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

