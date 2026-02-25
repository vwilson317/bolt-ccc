/*
  # Set generic barraca open status logic

  Goal:
  - Keep open/closed logic extremely simple and deterministic.
  - No per-barraca schedule reads.
  - Avoid production breakage from optional weekend-hours columns.

  Rules:
  - Open daily from 07:00 to 18:00 in America/Sao_Paulo local time.
*/

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

CREATE OR REPLACE FUNCTION is_barraca_open_now(
  barraca_id_param TEXT,
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

CREATE OR REPLACE FUNCTION get_barracas_with_open_status(
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10,
  search_query TEXT DEFAULT NULL,
  location_filter TEXT DEFAULT NULL,
  location_filters TEXT[] DEFAULT NULL,
  status_filter TEXT DEFAULT 'all',
  rating_filter INTEGER DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  barraca_number TEXT,
  location TEXT,
  coordinates JSONB,
  typical_hours TEXT,
  description TEXT,
  photos JSONB,
  menu_preview TEXT[],
  contact JSONB,
  amenities TEXT[],
  weather_dependent BOOLEAN,
  partnered BOOLEAN,
  weekend_hours_enabled BOOLEAN,
  weekend_hours_schedule JSONB,
  manual_status TEXT,
  special_admin_override BOOLEAN,
  special_admin_override_expires TIMESTAMPTZ,
  rating INTEGER,
  cta_buttons JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_open BOOLEAN,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH base_barracas AS (
    SELECT
      b.*,
      is_barraca_open_now(b.id) AS is_open
    FROM barracas b
    WHERE
      (
        search_query IS NULL OR
        to_tsvector('portuguese', b.name || ' ' || COALESCE(b.description, '')) @@ plainto_tsquery('portuguese', search_query) OR
        b.name ILIKE '%' || search_query || '%' OR
        b.barraca_number ILIKE '%' || search_query || '%' OR
        b.location ILIKE '%' || search_query || '%'
      )
      AND (location_filter IS NULL OR b.location ILIKE '%' || location_filter || '%')
      AND (location_filters IS NULL OR b.location ILIKE ANY(location_filters))
      AND (rating_filter IS NULL OR b.rating = rating_filter)
  ),
  filtered_barracas AS (
    SELECT *
    FROM base_barracas bb
    WHERE
      status_filter = 'all' OR
      (status_filter = 'open' AND bb.is_open) OR
      (status_filter = 'closed' AND NOT bb.is_open)
  ),
  total_counts AS (
    SELECT COUNT(*) AS total_count
    FROM filtered_barracas
  )
  SELECT
    fb.id,
    fb.name,
    fb.barraca_number,
    fb.location,
    fb.coordinates,
    fb.typical_hours,
    fb.description,
    fb.photos,
    fb.menu_preview,
    fb.contact,
    fb.amenities,
    fb.weather_dependent,
    fb.partnered,
    FALSE AS weekend_hours_enabled,
    NULL::JSONB AS weekend_hours_schedule,
    fb.manual_status,
    fb.special_admin_override,
    fb.special_admin_override_expires,
    fb.rating,
    fb.cta_buttons,
    fb.created_at,
    fb.updated_at,
    fb.is_open,
    tc.total_count
  FROM filtered_barracas fb
  CROSS JOIN total_counts tc
  ORDER BY fb.partnered DESC, fb.name ASC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
