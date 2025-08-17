-- Migration: Add rating column to barracas table
-- Add rating column (1-3 stars) to barracas table
ALTER TABLE barracas ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 3);

-- Add index for efficient rating filtering
CREATE INDEX IF NOT EXISTS idx_barracas_rating ON barracas(rating);

-- Update the search_barracas function to support rating filtering
CREATE OR REPLACE FUNCTION search_barracas(
  search_query text,
  location_filter text DEFAULT NULL,
  open_only boolean DEFAULT false,
  rating_filter integer DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS TABLE(
  id text,
  name text,
  location text,
  is_open boolean,
  rating integer,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.location,
    is_barraca_open_now(b.id) as is_open,
    b.rating,
    ts_rank(to_tsvector('portuguese', b.name || ' ' || b.description), plainto_tsquery('portuguese', search_query)) as rank
  FROM barracas b
  WHERE 
    (search_query IS NULL OR to_tsvector('portuguese', b.name || ' ' || b.description) @@ plainto_tsquery('portuguese', search_query))
    AND (location_filter IS NULL OR b.location ILIKE '%' || location_filter || '%')
    AND (NOT open_only OR is_barraca_open_now(b.id))
    AND (rating_filter IS NULL OR b.rating = rating_filter)
  ORDER BY rank DESC, b.rating DESC NULLS LAST
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 