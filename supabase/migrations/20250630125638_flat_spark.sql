/*
  # UAT Environment Data Seeding

  1. Purpose
     - Minimal realistic data for user acceptance testing
     - Clean environment for stakeholder demos
     - Production-like scenarios without test artifacts
     - User journey validation data

  2. Data Volume
     - 4 barracas (core representative types)
     - 4 stories (minimal story testing)
     - 5 email subscriptions (basic functionality)
     - Essential business hours
     - Minimal analytics data

  3. Features
     - Real-world representative data
     - Clean, professional content
     - No test artifacts or debug data
     - Stakeholder-friendly scenarios
*/

-- Only run in UAT environment
DO $$
BEGIN
  IF current_setting('app.environment', true) != 'uat' THEN
    RAISE NOTICE 'Skipping UAT seed - not in UAT environment';
    RETURN;
  END IF;
END $$;

-- Clear existing data (UAT only)
TRUNCATE TABLE visitor_analytics, weather_cache, email_subscriptions, stories, business_hours, barracas CASCADE;

-- Insert minimal barraca data for UAT
INSERT INTO barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at) VALUES

-- Premium Example
('uat-premium', 'Barraca Premium', '001', 'Ipanema', 
 '{"lat": -22.9838, "lng": -43.2096}', 
 true, '09:00 - 19:00', 
 'Premium beachside experience with high-quality products and exceptional service.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'],
 ARRAY['Premium Swimwear', 'Gourmet Snacks', 'Craft Beverages'],
 '{"phone": "+55 21 99999-0001", "email": "premium@example.com", "website": "https://premium-example.com"}',
 ARRAY['Personal Service', 'WiFi', 'Premium Amenities'],
 false,
 '[{"text": "Book Now", "url": "https://premium-example.com/book"}]'::jsonb, '2024-01-01 09:00:00+00', NOW()),

-- Traditional Example
('uat-traditional', 'Barraca Tradicional', '002', 'Copacabana', 
 '{"lat": -22.9711, "lng": -43.1822}', 
 true, '8:00 - 18:00', 
 'Traditional Brazilian beach experience with authentic local food and drinks.',
 ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg'],
 ARRAY['Caipirinha', 'Fresh Seafood', 'Coconut Water'],
 '{"phone": "+55 21 99999-0002"}',
 ARRAY['Traditional Food', 'Beach Chairs', 'Umbrellas'],
 true,
 '[{"text": "Book Now", "url": "https://traditional-example.com/book"}]'::jsonb, '2024-01-01 08:00:00+00', NOW()),

-- Modern Example
('uat-modern', 'Barraca Moderna', '003', 'Leblon', 
 '{"lat": -22.9840, "lng": -43.2277}', 
 true, '10:00 - 20:00', 
 'Modern beach venue with contemporary cuisine and stylish atmosphere.',
 ARRAY['https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'],
 ARRAY['Healthy Bowls', 'Craft Cocktails', 'Artisan Coffee'],
 '{"phone": "+55 21 99999-0003", "website": "https://modern-example.com"}',
 ARRAY['Modern Design', 'Healthy Options', 'Instagram-worthy'],
 false,
 '[{"text": "Book Now", "url": "https://modern-example.com/book"}]'::jsonb, '2024-01-01 10:00:00+00', NOW()),

-- Family Example
('uat-family', 'Barraca Família', '004', 'Barra da Tijuca', 
 '{"lat": -23.0129, "lng": -43.3187}', 
 true, '9:00 - 17:00', 
 'Family-friendly beach spot with activities for all ages and kid-friendly menu.',
 ARRAY['https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg'],
 ARRAY['Kids Menu', 'Family Meals', 'Fresh Juices'],
 '{"phone": "+55 21 99999-0004"}',
 ARRAY['Kids Area', 'Family Tables', 'Safe Environment'],
 false,
 '[{"text": "Book Now", "url": "https://family-example.com/book"}]'::jsonb, '2024-01-01 09:00:00+00', NOW());

-- Insert essential business hours for UAT
INSERT INTO business_hours (barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, notes) VALUES
-- Premium - closed Sundays
('uat-premium', 0, false, NULL, NULL, 'Closed Sundays'),
('uat-premium', 1, true, '12:00'::time, '22:00'::time, 'Monday - Saturday'),
('uat-premium', 2, true, '12:00'::time, '22:00'::time, 'Monday - Saturday'),
('uat-premium', 3, true, '12:00'::time, '22:00'::time, 'Monday - Saturday'),
('uat-premium', 4, true, '12:00'::time, '22:00'::time, 'Monday - Saturday'),
('uat-premium', 5, true, '12:00'::time, '22:00'::time, 'Monday - Saturday'),
('uat-premium', 6, true, '12:00'::time, '22:00'::time, 'Monday - Saturday'),

-- Traditional - daily operation
('uat-traditional', 0, true, '11:00'::time, '21:00'::time, 'Daily operation'),
('uat-traditional', 1, true, '11:00'::time, '21:00'::time, 'Daily operation'),
('uat-traditional', 2, true, '11:00'::time, '21:00'::time, 'Daily operation'),
('uat-traditional', 3, true, '11:00'::time, '21:00'::time, 'Daily operation'),
('uat-traditional', 4, true, '11:00'::time, '21:00'::time, 'Daily operation'),
('uat-traditional', 5, true, '11:00'::time, '21:00'::time, 'Daily operation'),
('uat-traditional', 6, true, '11:00'::time, '21:00'::time, 'Daily operation');

-- Insert minimal stories for UAT
INSERT INTO stories (id, barraca_id, media_url, media_type, caption, created_at, expires_at) VALUES
('uat-story-001', 'uat-premium', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'image', 'Welcome to our premium beach experience! ✨', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '22 hours'),
('uat-story-002', 'uat-traditional', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'image', 'Fresh seafood and traditional flavors 🐟', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '23 hours'),
('uat-story-003', 'uat-modern', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg', 'image', 'Modern cuisine meets beach vibes 🌊', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '21 hours'),
('uat-story-004', 'uat-family', 'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'image', 'Perfect day for families! 👨‍👩‍👧‍👦', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '20 hours');

-- Insert minimal email subscriptions for UAT
INSERT INTO email_subscriptions (email, preferences, subscribed_at, is_active) VALUES
('demo@cariocacoastal.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 month', true),
('stakeholder@company.com', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '2 weeks', true),
('user@example.com', '{"newBarracas": false, "specialOffers": true}', NOW() - INTERVAL '1 week', true),
('customer@beach.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '3 days', true),
('visitor@rio.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 day', true);

-- Insert current weather cache for UAT
INSERT INTO weather_cache (location, temperature, feels_like, humidity, wind_speed, wind_direction, description, icon, beach_conditions, cached_at, expires_at) VALUES
('Rio de Janeiro', 27.0, 30.0, 68, 12.0, 180, 'Partly Cloudy', 'partly-cloudy', 'excellent', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '10 minutes'),
('Copacabana', 26.5, 29.5, 70, 10.0, 175, 'Sunny', 'sunny', 'excellent', NOW() - INTERVAL '3 minutes', NOW() + INTERVAL '12 minutes'),
('Ipanema', 27.5, 30.5, 66, 14.0, 185, 'Clear', 'clear', 'excellent', NOW() - INTERVAL '2 minutes', NOW() + INTERVAL '13 minutes'),
('Leblon', 27.0, 30.0, 68, 13.0, 180, 'Perfect', 'sunny', 'excellent', NOW() - INTERVAL '1 minute', NOW() + INTERVAL '14 minutes');

-- Insert minimal visitor analytics for UAT
INSERT INTO visitor_analytics (visitor_id, first_visit, last_visit, visit_count, user_agent, referrer, country, city, created_at) VALUES
('uat_visitor_001', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 hour', 15, 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', 'https://google.com', 'BR', 'Rio de Janeiro', NOW() - INTERVAL '1 month'),
('uat_visitor_002', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 hours', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'https://instagram.com', 'US', 'New York', NOW() - INTERVAL '2 weeks'),
('uat_visitor_003', NOW() - INTERVAL '1 week', NOW() - INTERVAL '30 minutes', 5, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'https://tripadvisor.com', 'FR', 'Paris', NOW() - INTERVAL '1 week'),
('uat_visitor_004', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 hours', 3, 'Mozilla/5.0 (Android 12; Mobile)', 'https://booking.com', 'AR', 'Buenos Aires', NOW() - INTERVAL '3 days'),
('uat_visitor_005', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour', 2, 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)', 'direct', 'BR', 'São Paulo', NOW() - INTERVAL '1 day');

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'UAT environment seeded successfully with:';
  RAISE NOTICE '- 4 representative barracas';
  RAISE NOTICE '- 4 clean stories for demo';
  RAISE NOTICE '- 5 realistic email subscriptions';
  RAISE NOTICE '- Essential business hours';
  RAISE NOTICE '- Current weather and visitor data';
END $$;