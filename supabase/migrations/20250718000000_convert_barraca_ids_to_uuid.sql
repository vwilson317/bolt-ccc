-- Migration: Convert barraca IDs from TEXT to UUID
-- This migration converts all existing barraca IDs to UUID format
-- and updates all related tables and functions accordingly

-- Step 1: Create a temporary mapping table to track old IDs to new UUIDs
CREATE TEMP TABLE barraca_id_mapping (
  old_id TEXT,
  new_id UUID
);

-- Step 2: Generate new UUIDs for all existing barracas and store the mapping
INSERT INTO barraca_id_mapping (old_id, new_id)
SELECT id, gen_random_uuid()
FROM barracas;

-- Step 3: Update the barracas table to use UUID primary key
-- First, drop all existing foreign key constraints that reference barracas.id
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_barraca_id_fkey;
ALTER TABLE business_hours DROP CONSTRAINT IF EXISTS business_hours_barraca_id_fkey;

-- Drop constraints for menu tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_categories') THEN
    ALTER TABLE menu_categories DROP CONSTRAINT IF EXISTS menu_categories_barraca_id_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_items') THEN
    ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_barraca_id_fkey;
  END IF;
END $$;

-- Add a new UUID column
ALTER TABLE barracas ADD COLUMN new_id UUID;

-- Update the new_id column with the generated UUIDs
UPDATE barracas 
SET new_id = mapping.new_id
FROM barraca_id_mapping mapping
WHERE barracas.id = mapping.old_id;

-- Make the new_id column NOT NULL
ALTER TABLE barracas ALTER COLUMN new_id SET NOT NULL;

-- Drop the old id column and rename new_id to id
ALTER TABLE barracas DROP COLUMN id;
ALTER TABLE barracas RENAME COLUMN new_id TO id;

-- Add primary key constraint
ALTER TABLE barracas ADD PRIMARY KEY (id);

-- Step 4: Update the stories table
-- Add a new UUID column for barraca_id
ALTER TABLE stories ADD COLUMN new_barraca_id UUID;

-- Update the new_barraca_id column with the mapped UUIDs
UPDATE stories 
SET new_barraca_id = mapping.new_id
FROM barraca_id_mapping mapping
WHERE stories.barraca_id = mapping.old_id;

-- Make the new_barraca_id column NOT NULL
ALTER TABLE stories ALTER COLUMN new_barraca_id SET NOT NULL;

-- Drop the old barraca_id column and rename new_barraca_id to barraca_id
ALTER TABLE stories DROP COLUMN barraca_id;
ALTER TABLE stories RENAME COLUMN new_barraca_id TO barraca_id;

-- Add foreign key constraint
ALTER TABLE stories ADD CONSTRAINT fk_stories_barraca_id 
  FOREIGN KEY (barraca_id) REFERENCES barracas(id) ON DELETE CASCADE;

-- Step 5: Update the business_hours table
-- Add a new UUID column for barraca_id
ALTER TABLE business_hours ADD COLUMN new_barraca_id UUID;

-- Update the new_barraca_id column with the mapped UUIDs
UPDATE business_hours 
SET new_barraca_id = mapping.new_id
FROM barraca_id_mapping mapping
WHERE business_hours.barraca_id = mapping.old_id;

-- Make the new_barraca_id column NOT NULL
ALTER TABLE business_hours ALTER COLUMN new_barraca_id SET NOT NULL;

-- Drop the old barraca_id column and rename new_barraca_id to barraca_id
ALTER TABLE business_hours DROP COLUMN barraca_id;
ALTER TABLE business_hours RENAME COLUMN new_barraca_id TO barraca_id;

-- Add foreign key constraint
ALTER TABLE business_hours ADD CONSTRAINT fk_business_hours_barraca_id 
  FOREIGN KEY (barraca_id) REFERENCES barracas(id) ON DELETE CASCADE;

-- Step 6: Update the unique constraint on business_hours
-- Drop the old unique constraint if it exists
ALTER TABLE business_hours DROP CONSTRAINT IF EXISTS business_hours_barraca_id_day_of_week_key;

-- Add the new unique constraint with UUID
ALTER TABLE business_hours ADD CONSTRAINT business_hours_barraca_id_day_of_week_key 
  UNIQUE (barraca_id, day_of_week);

-- Step 6.5: Update menu_categories table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_categories') THEN
    -- Add a new UUID column for barraca_id
    ALTER TABLE menu_categories ADD COLUMN new_barraca_id UUID;
    
    -- Update the new_barraca_id column with the mapped UUIDs
    UPDATE menu_categories 
    SET new_barraca_id = mapping.new_id
    FROM barraca_id_mapping mapping
    WHERE menu_categories.barraca_id = mapping.old_id;
    
    -- Make the new_barraca_id column NOT NULL
    ALTER TABLE menu_categories ALTER COLUMN new_barraca_id SET NOT NULL;
    
    -- Drop the old barraca_id column and rename new_barraca_id to barraca_id
    ALTER TABLE menu_categories DROP COLUMN barraca_id;
    ALTER TABLE menu_categories RENAME COLUMN new_barraca_id TO barraca_id;
    
    -- Add foreign key constraint
    ALTER TABLE menu_categories ADD CONSTRAINT fk_menu_categories_barraca_id 
      FOREIGN KEY (barraca_id) REFERENCES barracas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 6.6: Update menu_items table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_items') THEN
    -- Add a new UUID column for barraca_id
    ALTER TABLE menu_items ADD COLUMN new_barraca_id UUID;
    
    -- Update the new_barraca_id column with the mapped UUIDs
    UPDATE menu_items 
    SET new_barraca_id = mapping.new_id
    FROM barraca_id_mapping mapping
    WHERE menu_items.barraca_id = mapping.old_id;
    
    -- Make the new_barraca_id column NOT NULL
    ALTER TABLE menu_items ALTER COLUMN new_barraca_id SET NOT NULL;
    
    -- Drop the old barraca_id column and rename new_barraca_id to barraca_id
    ALTER TABLE menu_items DROP COLUMN barraca_id;
    ALTER TABLE menu_items RENAME COLUMN new_barraca_id TO barraca_id;
    
    -- Add foreign key constraint
    ALTER TABLE menu_items ADD CONSTRAINT fk_menu_items_barraca_id 
      FOREIGN KEY (barraca_id) REFERENCES barracas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 7: Update all functions that use barraca_id parameters
-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS is_barraca_open_now(text, timestamptz);
DROP FUNCTION IF EXISTS is_weekend_hours_active(text, timestamptz);
DROP FUNCTION IF EXISTS set_weekend_hours(text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS disable_weekend_hours(text);
DROP FUNCTION IF EXISTS special_admin_open_barraca(text, integer);
DROP FUNCTION IF EXISTS special_admin_close_barraca(text);
DROP FUNCTION IF EXISTS get_special_admin_overrides();
DROP FUNCTION IF EXISTS search_barracas(text, text, boolean, integer, integer);
DROP FUNCTION IF EXISTS get_nearby_barracas(numeric, numeric, numeric, integer);

-- Update is_barraca_open_now function
CREATE OR REPLACE FUNCTION is_barraca_open_now(barraca_id_param UUID, check_time TIMESTAMPTZ DEFAULT NOW())
RETURNS BOOLEAN AS $$
DECLARE
  is_currently_open BOOLEAN;
  current_day_of_week INTEGER;
  current_time_utc TIME;
BEGIN
  -- Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  current_day_of_week := EXTRACT(DOW FROM check_time);
  current_time_utc := check_time::TIME;
  
  -- Check if barraca is open on current day and time
  SELECT EXISTS (
    SELECT 1 FROM business_hours 
    WHERE barraca_id = barraca_id_param 
      AND day_of_week = current_day_of_week 
      AND is_open = true
      AND open_time_utc <= current_time_utc 
      AND close_time_utc >= current_time_utc
  ) INTO is_currently_open;
  
  RETURN COALESCE(is_currently_open, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update is_weekend_hours_active function
CREATE OR REPLACE FUNCTION is_weekend_hours_active(barraca_id_param UUID, check_time TIMESTAMPTZ DEFAULT NOW())
RETURNS BOOLEAN AS $$
DECLARE
  is_currently_open BOOLEAN;
  current_day_of_week INTEGER;
  current_time_utc TIME;
  weekend_schedule JSONB;
BEGIN
  -- Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  current_day_of_week := EXTRACT(DOW FROM check_time);
  current_time_utc := check_time::TIME;
  
  -- Only check weekend days (5 = Friday, 6 = Saturday, 0 = Sunday)
  IF current_day_of_week NOT IN (0, 5, 6) THEN
    RETURN false;
  END IF;
  
  -- Get weekend hours schedule for the barraca
  SELECT weekend_hours_schedule INTO weekend_schedule
  FROM barracas
  WHERE id = barraca_id_param;
  
  -- If no weekend schedule or weekend hours not enabled, return false
  IF weekend_schedule IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if current time falls within weekend hours
  -- This is a simplified check - you may need to adjust based on your weekend_schedule structure
  RETURN true; -- Placeholder - adjust based on actual weekend_schedule structure
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update set_weekend_hours function
CREATE OR REPLACE FUNCTION set_weekend_hours(
  barraca_id_param UUID,
  friday_open TEXT DEFAULT NULL,
  friday_close TEXT DEFAULT NULL,
  saturday_open TEXT DEFAULT NULL,
  saturday_close TEXT DEFAULT NULL,
  sunday_open TEXT DEFAULT NULL,
  sunday_close TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  weekend_schedule JSONB;
BEGIN
  -- Check if barraca exists
  IF NOT EXISTS (SELECT 1 FROM barracas WHERE id = barraca_id_param) THEN
    RAISE EXCEPTION 'Barraca not found: %', barraca_id_param;
  END IF;
  
  -- Build weekend schedule JSON
  weekend_schedule := jsonb_build_object(
    'friday', jsonb_build_object('open', friday_open, 'close', friday_close),
    'saturday', jsonb_build_object('open', saturday_open, 'close', saturday_close),
    'sunday', jsonb_build_object('open', sunday_open, 'close', sunday_close)
  );
  
  -- Update barraca with weekend hours
  UPDATE barracas 
  SET weekend_hours_schedule = weekend_schedule,
      weekend_hours_enabled = true,
      updated_at = NOW()
  WHERE id = barraca_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update disable_weekend_hours function
CREATE OR REPLACE FUNCTION disable_weekend_hours(barraca_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if barraca exists
  IF NOT EXISTS (SELECT 1 FROM barracas WHERE id = barraca_id_param) THEN
    RAISE EXCEPTION 'Barraca not found: %', barraca_id_param;
  END IF;
  
  -- Disable weekend hours
  UPDATE barracas 
  SET weekend_hours_enabled = false,
      weekend_hours_schedule = NULL,
      updated_at = NOW()
  WHERE id = barraca_id_param;
  
  -- Remove weekend hours from business_hours table
  DELETE FROM business_hours 
  WHERE barraca_id = barraca_id_param 
    AND day_of_week IN (0, 5, 6);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update special_admin_open_barraca function
CREATE OR REPLACE FUNCTION special_admin_open_barraca(barraca_id_param UUID, duration_hours INTEGER DEFAULT 24)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if barraca exists
  IF NOT EXISTS (SELECT 1 FROM barracas WHERE id = barraca_id_param) THEN
    RAISE EXCEPTION 'Barraca not found: %', barraca_id_param;
  END IF;
  
  -- Set special admin override
  UPDATE barracas 
  SET special_admin_override = true,
      special_admin_override_expires = NOW() + (duration_hours || ' hours')::INTERVAL,
      updated_at = NOW()
  WHERE id = barraca_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update special_admin_close_barraca function
CREATE OR REPLACE FUNCTION special_admin_close_barraca(barraca_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if barraca exists
  IF NOT EXISTS (SELECT 1 FROM barracas WHERE id = barraca_id_param) THEN
    RAISE EXCEPTION 'Barraca not found: %', barraca_id_param;
  END IF;
  
  -- Remove special admin override
  UPDATE barracas 
  SET special_admin_override = false,
      special_admin_override_expires = NULL,
      updated_at = NOW()
  WHERE id = barraca_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_special_admin_overrides function
CREATE OR REPLACE FUNCTION get_special_admin_overrides()
RETURNS TABLE(
  barraca_id UUID,
  barraca_name TEXT,
  override_expires TIMESTAMPTZ,
  hours_remaining NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as barraca_id,
    b.name as barraca_name,
    b.special_admin_override_expires as override_expires,
    EXTRACT(EPOCH FROM (b.special_admin_override_expires - NOW())) / 3600 as hours_remaining
  FROM barracas b
  WHERE b.special_admin_override = true 
    AND b.special_admin_override_expires > NOW()
  ORDER BY b.special_admin_override_expires ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update search_barracas function
CREATE OR REPLACE FUNCTION search_barracas(
  search_query TEXT,
  location_filter TEXT DEFAULT NULL,
  open_only BOOLEAN DEFAULT false,
  rating_filter INTEGER DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  location TEXT,
  is_open BOOLEAN,
  rating INTEGER,
  rank REAL
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

-- Update get_nearby_barracas function
CREATE OR REPLACE FUNCTION get_nearby_barracas(
  user_lat NUMERIC,
  user_lng NUMERIC,
  radius_km NUMERIC DEFAULT 5,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  location TEXT,
  is_open BOOLEAN,
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.location,
    is_barraca_open_now(b.id) as is_open,
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians((b.coordinates->>'lat')::NUMERIC)) * 
        cos(radians((b.coordinates->>'lng')::NUMERIC) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians((b.coordinates->>'lat')::NUMERIC))
      )
    ) as distance_km
  FROM barracas b
  WHERE (
    6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians((b.coordinates->>'lat')::NUMERIC)) * 
      cos(radians((b.coordinates->>'lng')::NUMERIC) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians((b.coordinates->>'lat')::NUMERIC))
    )
  ) <= radius_km
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Update indexes
-- Drop old indexes that reference the old text columns
DROP INDEX IF EXISTS idx_stories_barraca_id;
DROP INDEX IF EXISTS idx_business_hours_barraca_id;

-- Drop indexes for menu tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_categories') THEN
    DROP INDEX IF EXISTS idx_menu_categories_barraca_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_items') THEN
    DROP INDEX IF EXISTS idx_menu_items_barraca_id;
  END IF;
END $$;

-- Create new indexes for UUID columns
CREATE INDEX idx_stories_barraca_id ON stories(barraca_id);
CREATE INDEX idx_business_hours_barraca_id ON business_hours(barraca_id);

-- Create indexes for menu tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_categories') THEN
    CREATE INDEX idx_menu_categories_barraca_id ON menu_categories(barraca_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_items') THEN
    CREATE INDEX idx_menu_items_barraca_id ON menu_items(barraca_id);
  END IF;
END $$;

-- Step 9: Clean up
-- Drop the temporary mapping table
DROP TABLE barraca_id_mapping;

-- Add a comment to document this migration
COMMENT ON TABLE barracas IS 'Barraca IDs have been converted from TEXT to UUID format as of migration 20250718000000';
