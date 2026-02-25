/*
  # Resolve PostgREST overload ambiguity for is_barraca_open_now

  PGRST203 happens because PostgREST cannot choose between overloaded
  signatures when RPC arguments can coerce to multiple candidates.

  Keep only UUID signature for RPC stability.
*/

-- Remove ambiguous overload used by PostgREST candidate resolution
DROP FUNCTION IF EXISTS is_barraca_open_now(TEXT, TIMESTAMPTZ);

-- Ensure UUID variant exists with the generic 07:00-18:00 local logic
CREATE OR REPLACE FUNCTION is_barraca_open_now(
  barraca_id_param UUID,
  check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  current_time_local TIME;
BEGIN
  current_time_local := (check_time AT TIME ZONE 'America/Sao_Paulo')::TIME;

  RETURN current_time_local >= TIME '07:00'
     AND current_time_local <= TIME '18:00';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ask PostgREST to reload schema cache (relevant for self-hosted/edge cases)
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION WHEN OTHERS THEN
  -- No-op if notify isn't available/needed
  NULL;
END;
$$;
