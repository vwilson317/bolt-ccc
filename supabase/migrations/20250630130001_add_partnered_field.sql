-- Add partnered field to barracas table
ALTER TABLE barracas ADD COLUMN IF NOT EXISTS partnered BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_barracas_partnered ON barracas(partnered);

-- Update existing barracas to mark some as partnered
UPDATE barracas SET partnered = true WHERE id IN (
  'barraca-uruguay',
  'dev-001',
  'dev-002',
  'dev-003'
);

-- Add some non-partnered barracas for testing
INSERT INTO barracas (id, name, barraca_number, location, coordinates, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, partnered, created_at, updated_at) VALUES
('non-partnered-001', 'Barraca Local', '101', 'Copacabana', 
 '{"lat": -22.9715, "lng": -43.1825}', 
 '8:00 - 17:00', 
 'Local family-owned barraca with traditional beach food and friendly service.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg'],
 ARRAY['Caipirinha', 'Grilled Fish', 'Coconut Water'],
 '{"phone": "+55 21 99999-0001"}',
 ARRAY['Basic Chairs', 'Umbrellas'],
 true,
 '[]'::jsonb, false, '2024-01-01 08:00:00+00', NOW()),
('non-partnered-002', 'Beach Corner', '102', 'Ipanema', 
 '{"lat": -22.9840, "lng": -43.2100}', 
 '9:00 - 18:00', 
 'Simple beach corner with basic amenities and affordable prices.',
 ARRAY['https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'],
 ARRAY['Cold Drinks', 'Simple Snacks', 'Ice Cream'],
 '{"phone": "+55 21 99999-0002"}',
 ARRAY['Basic Chairs'],
 false,
 '[]'::jsonb, false, '2024-01-01 09:00:00+00', NOW()),
('non-partnered-003', 'Sunset Spot', '103', 'Arpoador', 
 '{"lat": -22.9870, "lng": -43.2090}', 
 '14:00 - 20:00', 
 'Basic sunset viewing spot with minimal services.',
 ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg'],
 ARRAY['Cold Beer', 'Simple Drinks'],
 '{"phone": "+55 21 99999-0003"}',
 ARRAY['Basic Seating'],
 true,
 '[]'::jsonb, false, '2024-01-01 14:00:00+00', NOW())
ON CONFLICT (id) DO NOTHING; 