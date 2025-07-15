-- Migration: Update images to photos (horizontal/vertical) JSON structure for barracas

-- 1. Add new photos column
ALTER TABLE barracas ADD COLUMN photos jsonb DEFAULT '{"horizontal":[],"vertical":[]}';
COMMENT ON COLUMN barracas.photos IS 'JSON object with horizontal and vertical image arrays. {horizontal: string[], vertical: string[]}';

-- 2. Migrate existing images data to photos.horizontal
UPDATE barracas SET photos = jsonb_build_object('horizontal', to_jsonb(images), 'vertical', '[]'::jsonb) WHERE images IS NOT NULL;

-- 3. Drop the old images column
ALTER TABLE barracas DROP COLUMN images; 