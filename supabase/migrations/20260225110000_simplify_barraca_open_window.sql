/*
  # Simplify Barraca Open Logic

  Keep open/closed behavior intentionally simple:
  - Open daily from 07:00 to 17:00 (America/Sao_Paulo local time)
  - Ignore per-barraca business hours, weekend hours, and manual/special overrides
*/

CREATE OR REPLACE FUNCTION is_barraca_open_now(
  barraca_id_param UUID,
  check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  current_time_local TIME;
BEGIN
  -- Keep previous behavior for missing records
  IF NOT EXISTS (SELECT 1 FROM barracas WHERE id = barraca_id_param) THEN
    RETURN FALSE;
  END IF;

  current_time_local := (check_time AT TIME ZONE 'America/Sao_Paulo')::TIME;

  RETURN current_time_local >= TIME '07:00'
     AND current_time_local <= TIME '18:00';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backward-compatible text variant
CREATE OR REPLACE FUNCTION is_barraca_open_now(
  barraca_id_param TEXT,
  check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  barraca_uuid UUID;
BEGIN
  barraca_uuid := barraca_id_param::UUID;
  RETURN is_barraca_open_now(barraca_uuid, check_time);
EXCEPTION WHEN invalid_text_representation THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
