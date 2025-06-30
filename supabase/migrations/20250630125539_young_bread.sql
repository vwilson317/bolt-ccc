/*
  # QA Environment Data Seeding

  1. Purpose
     - Subset of data for focused testing scenarios
     - Specific test cases for QA validation
     - Edge cases and boundary conditions
     - Performance testing data

  2. Data Volume
     - 6 barracas (representative sample)
     - 8 stories for story feature testing
     - 10 email subscriptions
     - Selected business hours scenarios
     - Focused analytics data

  3. Features
     - Key barraca types for testing
     - Story expiration scenarios
     - Email preference variations
     - Performance edge cases
*/

-- Only run in QA environment
DO $$
BEGIN
  IF current_setting('app.environment', true) != 'qa' THEN
    RAISE NOTICE 'Skipping QA seed - not in QA environment';
    RETURN;
  END IF;
END $$;

-- Clear existing data (QA only)
TRUNCATE TABLE visitor_analytics, weather_cache, email_subscriptions, stories, business_hours, barracas CASCADE;

-- Insert focused barraca data for QA testing
INSERT INTO barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at) VALUES

-- Premium Retail (for e-commerce testing)
('qa-premium', 'QA Premium Store', '001', 'Ipanema',
 '{"lat": -22.9838, "lng": -43.2096}',
 true, '09:00 - 19:00',
 'QA test store for premium retail functionality testing.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'],
 ARRAY['Test Product A', 'Test Product B', 'Test Product C'],
 '{"phone": "+55 21 99999-0001", "email": "qa@test.com", "website": "https://qa-test.com"}',
 ARRAY['Test Amenity 1', 'Test Amenity 2'],
 false,
 '[{"id": "qa-test-btn", "text": "QA Test", "action": {"type": "url", "value": "https://qa-test.com"}, "style": "primary", "position": 1, "visibilityConditions": {}, "enabled": true}]'::jsonb,
 '2024-01-01 10:00:00+00', NOW()),

-- Traditional (for basic functionality)
('qa-traditional', 'QA Traditional Bar', '002', 'Copacabana',
 '{"lat": -22.9711, "lng": -43.1822}',
 true, '8:00 - 18:00',
 'QA test barraca for traditional functionality testing.',
 ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg'],
 ARRAY['Basic Item 1', 'Basic Item 2'],
 '{"phone": "+55 21 99999-0002"}',
 ARRAY['Basic Amenity'],
 true,
 '[]'::jsonb, '2024-01-01 08:00:00+00', NOW()),

-- Closed Barraca (for status testing)
('qa-closed', 'QA Closed Venue', '003', 'Leblon',
 '{"lat": -22.9840, "lng": -43.2277}',
 false, '10:00 - 20:00',
 'QA test barraca for closed status testing.',
 ARRAY['https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'],
 ARRAY['Unavailable Item'],
 '{"email": "closed@qa-test.com"}',
 ARRAY['Closed Amenity'],
 false,
 '[]'::jsonb, '2024-01-01 10:00:00+00', NOW()),

-- Weather Dependent (for weather testing)
('qa-weather', 'QA Weather Dependent', '004', 'Barra da Tijuca',
 '{"lat": -23.0129, "lng": -43.3187}',
 true, '7:00 - 17:00',
 'QA test barraca for weather dependency testing.',
 ARRAY['https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg'],
 ARRAY['Weather Item'],
 '{"phone": "+55 21 99999-0004"}',
 ARRAY['Weather Amenity'],
 true,
 '[]'::jsonb, '2024-01-01 07:00:00+00', NOW()),

-- Complex Hours (for business hours testing)
('qa-complex', 'QA Complex Hours', '005', 'São Conrado',
 '{"lat": -23.0089, "lng": -43.2567}',
 true, '11:00 - 23:00',
 'QA test barraca for complex business hours testing.',
 ARRAY['https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'],
 ARRAY['Complex Item'],
 '{"phone": "+55 21 99999-0005", "website": "https://complex.qa-test.com"}',
 ARRAY['Complex Amenity'],
 false,
 '[]'::jsonb, '2024-01-01 11:00:00+00', NOW()),

-- Minimal Data (for edge case testing)
('qa-minimal', 'QA Minimal', '006', 'Leme',
 '{"lat": -22.9658, "lng": -43.1729}',
 true, '9:00 - 17:00',
 'Minimal QA test barraca.',
 ARRAY['https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'],
 ARRAY['Item'],
 '{}'::jsonb,
 ARRAY[]::TEXT[],
 false,
 '[]'::jsonb, '2024-01-01 09:00:00+00', NOW());

-- Insert business hours for QA testing scenarios
INSERT INTO business_hours (barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, break_start_utc, break_end_utc, notes) VALUES
-- Standard hours
('qa-premium', 1, true, '12:00'::time, '22:00'::time, NULL, NULL, 'QA Monday test'),
('qa-premium', 2, true, '12:00'::time, '22:00'::time, NULL, NULL, 'QA Tuesday test'),
('qa-premium', 3, true, '12:00'::time, '22:00'::time, NULL, NULL, 'QA Wednesday test'),
('qa-premium', 4, true, '12:00'::time, '22:00'::time, NULL, NULL, 'QA Thursday test'),
('qa-premium', 5, true, '12:00'::time, '23:00'::time, NULL, NULL, 'QA Friday test'),
('qa-premium', 6, true, '12:00'::time, '23:00'::time, NULL, NULL, 'QA Saturday test'),
('qa-premium', 0, false, NULL, NULL, NULL, NULL, 'QA Sunday closed'),

-- Complex hours with breaks
('qa-complex', 1, true, '14:00'::time, '02:00'::time, '18:00'::time, '19:00'::time, 'QA complex Monday'),
('qa-complex', 2, true, '14:00'::time, '02:00'::time, '18:00'::time, '19:00'::time, 'QA complex Tuesday'),
('qa-complex', 3, false, NULL, NULL, NULL, NULL, 'QA complex Wednesday closed'),
('qa-complex', 4, true, '14:00'::time, '02:00'::time, '18:00'::time, '19:00'::time, 'QA complex Thursday'),
('qa-complex', 5, true, '14:00'::time, '03:00'::time, NULL, NULL, 'QA complex Friday extended'),
('qa-complex', 6, true, '14:00'::time, '03:00'::time, NULL, NULL, 'QA complex Saturday extended'),
('qa-complex', 0, true, '16:00'::time, '24:00'::time, NULL, NULL, 'QA complex Sunday limited');

-- Insert stories for QA testing
INSERT INTO stories (id, barraca_id, media_url, media_type, caption, duration, created_at, expires_at) VALUES
-- Active stories
('qa-story-001', 'qa-premium', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'image', 'QA Test Story 1', NULL, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '23 hours'),
('qa-story-002', 'qa-premium', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg', 'image', 'QA Test Story 2', NULL, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '22 hours'),
('qa-story-003', 'qa-traditional', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'image', 'QA Traditional Story', NULL, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '23.5 hours'),

-- Video story for testing
('qa-story-004', 'qa-weather', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg', 'video', 'QA Video Story', 30, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '21 hours'),

-- Near expiration (for cleanup testing)
('qa-story-005', 'qa-complex', 'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'image', 'QA Expiring Story', NULL, NOW() - INTERVAL '23 hours', NOW() + INTERVAL '1 hour'),

-- Multiple stories for same barraca
('qa-story-006', 'qa-minimal', 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg', 'image', 'QA Minimal Story 1', NULL, NOW() - INTERVAL '4 hours', NOW() + INTERVAL '20 hours'),
('qa-story-007', 'qa-minimal', 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg', 'image', 'QA Minimal Story 2', NULL, NOW() - INTERVAL '5 hours', NOW() + INTERVAL '19 hours'),

-- Edge case: very long caption
('qa-story-008', 'qa-closed', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'image', 'QA Test Story with a very long caption that should test the UI layout and text wrapping functionality to ensure it displays properly across different screen sizes and devices', NULL, NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours');

-- Insert email subscriptions for QA testing
INSERT INTO email_subscriptions (email, preferences, subscribed_at, is_active) VALUES
-- Active subscribers with different preferences
('qa.test1@example.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 week', true),
('qa.test2@example.com', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '2 weeks', true),
('qa.test3@example.com', '{"newBarracas": false, "specialOffers": true}', NOW() - INTERVAL '3 weeks', true),
('qa.test4@example.com', '{"newBarracas": false, "specialOffers": false}', NOW() - INTERVAL '1 month', true),

-- Recent subscribers
('qa.recent@example.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 day', true),
('qa.new@example.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 hour', true),

-- Inactive subscribers
('qa.inactive1@example.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '6 months', false),
('qa.inactive2@example.com', '{"newBarracas": false, "specialOffers": false}', NOW() - INTERVAL '1 year', false),

-- Edge cases
('qa.edge.case+tag@very-long-domain-name-for-testing.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '2 days', true),
('qa.special.chars@test-domain.co.uk', '{"newBarracas": false, "specialOffers": true}', NOW() - INTERVAL '3 days', true);

-- Insert weather cache for QA testing
INSERT INTO weather_cache (location, temperature, feels_like, humidity, wind_speed, wind_direction, description, icon, beach_conditions, cached_at, expires_at) VALUES
-- Current weather
('Rio de Janeiro', 25.0, 28.0, 70, 15.0, 180, 'QA Test Weather', 'partly-cloudy', 'good', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '10 minutes'),
('Copacabana', 24.5, 27.5, 72, 16.0, 175, 'QA Copacabana', 'cloudy', 'fair', NOW() - INTERVAL '3 minutes', NOW() + INTERVAL '12 minutes'),
('Ipanema', 25.5, 28.5, 68, 14.0, 185, 'QA Ipanema', 'sunny', 'excellent', NOW() - INTERVAL '2 minutes', NOW() + INTERVAL '13 minutes'),

-- Edge case weather
('Leblon', 35.0, 40.0, 90, 30.0, 200, 'QA Extreme Weather', 'storm', 'poor', NOW() - INTERVAL '1 minute', NOW() + INTERVAL '14 minutes'),

-- Expired cache (for cleanup testing)
('Barra da Tijuca', 26.0, 29.0, 65, 12.0, 170, 'QA Expired', 'sunny', 'good', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '5 minutes');

-- Insert visitor analytics for QA testing
INSERT INTO visitor_analytics (visitor_id, first_visit, last_visit, visit_count, user_agent, referrer, country, city, created_at) VALUES
-- Test users
('qa_visitor_001', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 hour', 10, 'QA Test Agent 1', 'https://qa-test.com', 'BR', 'Rio de Janeiro', NOW() - INTERVAL '1 week'),
('qa_visitor_002', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours', 5, 'QA Test Agent 2', 'https://google.com', 'US', 'QA City', NOW() - INTERVAL '3 days'),
('qa_visitor_003', NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 minutes', 3, 'QA Test Agent 3', 'direct', 'QA', 'QA Location', NOW() - INTERVAL '1 day'),

-- Edge cases
('qa_visitor_edge_001', NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months', 1, 'QA Old Agent', 'https://old-referrer.com', 'XX', 'Unknown', NOW() - INTERVAL '6 months'),
('qa_visitor_power_001', NOW() - INTERVAL '2 months', NOW() - INTERVAL '15 minutes', 100, 'QA Power User Agent', 'direct', 'BR', 'São Paulo', NOW() - INTERVAL '2 months');

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'QA environment seeded successfully with:';
  RAISE NOTICE '- 6 barracas for focused testing';
  RAISE NOTICE '- 8 stories with various scenarios';
  RAISE NOTICE '- 10 email subscriptions with edge cases';
  RAISE NOTICE '- Complex business hours scenarios';
  RAISE NOTICE '- Weather and analytics test data';
END $$;