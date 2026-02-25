/*
  # Fix get_barracas_with_open_status weekend schedule source

  The RPC previously selected `weekend_hours_schedule` from `barracas`.
  In current production schema, that column is not present on `barracas`
  and weekend schedule data is stored in `business_hours`.

  This migration keeps the RPC return shape the same and sources
  `weekend_hours_schedule` from `business_hours`.
*/

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
  WITH filtered_barracas AS (
    SELECT 
      b.*,
      is_barraca_open_now(b.id) AS is_open
    FROM barracas b
    WHERE 
      (search_query IS NULL OR 
        to_tsvector('portuguese', b.name || ' ' || COALESCE(b.description, '')) @@ plainto_tsquery('portuguese', search_query) OR
        b.name ILIKE '%' || search_query || '%' OR
        b.barraca_number ILIKE '%' || search_query || '%' OR
        b.location ILIKE '%' || search_query || '%'
      )
      AND (location_filter IS NULL OR b.location ILIKE '%' || location_filter || '%')
      AND (location_filters IS NULL OR b.location ILIKE ANY(location_filters))
      AND (rating_filter IS NULL OR b.rating = rating_filter)
      AND (
        status_filter = 'all' OR
        (status_filter = 'open' AND is_barraca_open_now(b.id)) OR
        (status_filter = 'closed' AND NOT is_barraca_open_now(b.id))
      )
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
    fb.weekend_hours_enabled,
    (
      SELECT bh.weekend_hours_schedule
      FROM business_hours bh
      WHERE bh.barraca_id = fb.id
        AND bh.weekend_hours_schedule IS NOT NULL
      ORDER BY bh.day_of_week ASC
      LIMIT 1
    ) AS weekend_hours_schedule,
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
