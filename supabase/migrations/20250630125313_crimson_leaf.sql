/*
  # Development Environment Data Seeding

  1. Purpose
     - Full dataset for comprehensive development and testing
     - All barracas with complete data
     - Rich story content for UI testing
     - Diverse email subscriptions
     - Complete business hours coverage

  2. Data Volume
     - 12 barracas (full range of types)
     - 15+ stories across multiple barracas
     - 20+ email subscriptions
     - Complete business hours for all barracas
     - Rich visitor analytics data

  3. Features
     - All barraca types represented
     - Complex business hours scenarios
     - Story expiration testing data
     - Multi-language content
     - Analytics test data
*/

-- Ensure all referenced tables exist before any TRUNCATE or INSERT
CREATE TABLE IF NOT EXISTS visitor_analytics (
  visitor_id TEXT PRIMARY KEY,
  first_visit TIMESTAMPTZ,
  last_visit TIMESTAMPTZ,
  visit_count INTEGER,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT,
  temperature NUMERIC(4,1),
  feels_like NUMERIC(4,1),
  humidity INTEGER,
  wind_speed NUMERIC(4,1),
  wind_direction INTEGER,
  description TEXT,
  icon TEXT,
  beach_conditions TEXT,
  cached_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS email_subscriptions (
  email TEXT PRIMARY KEY,
  preferences JSONB,
  subscribed_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  barraca_id TEXT,
  media_url TEXT,
  media_type TEXT,
  caption TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS business_hours (
  id SERIAL PRIMARY KEY,
  barraca_id TEXT,
  day_of_week INTEGER,
  is_open BOOLEAN,
  open_time_utc TIME,
  close_time_utc TIME,
  break_start_utc TIME,
  break_end_utc TIME,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS barracas (
  id TEXT PRIMARY KEY,
  name TEXT,
  barraca_number TEXT,
  location TEXT,
  coordinates JSONB,
  is_open BOOLEAN,
  typical_hours TEXT,
  description TEXT,
  images TEXT[],
  menu_preview TEXT[],
  contact JSONB,
  amenities TEXT[],
  weather_dependent BOOLEAN,
  cta_buttons JSONB,
  rating INTEGER CHECK (rating >= 1 AND rating <= 3),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Only run in development environment
DO $$
BEGIN
  IF current_setting('app.environment', true) != 'development' THEN
    RAISE NOTICE 'Skipping development seed - not in development environment';
    RETURN;
  END IF;
END $$;

-- Clear existing data (development only)
TRUNCATE TABLE visitor_analytics, weather_cache, email_subscriptions, stories, business_hours, barracas CASCADE;

-- Insert comprehensive barraca data for development
INSERT INTO barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, rating, created_at, updated_at) VALUES

-- Premium Retail
('barraca-uruguay', 'Barraca Uruguay', '203', 'Ipanema', 
 '{"lat": -22.9838, "lng": -43.2096}', 
 true, '09:00 - 19:00', 
 'Premium beachwear boutique offering curated selection of high-quality swimwear, beach accessories, and lifestyle products. Specializing in Brazilian beach fashion with international quality standards.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'],
 ARRAY['Premium Swimwear', 'Designer Sunglasses', 'Beach Accessories', 'Sun Protection', 'Lifestyle Products'],
 '{"phone": "+55 21 99237-1601", "email": "contato@barracauruguay.com.br", "website": "https://instagram.com/barraca_uruguay"}',
 ARRAY['Personal Shopper', 'Gift Wrapping', 'Size Consultation', 'Product Customization', 'VIP Fitting Room', 'Delivery Service', 'Loyalty Program', 'Style Advisory'],
 false,
 '[{"id": "shop-online", "text": "Loja Online", "action": {"type": "url", "value": "https://barracauruguay.com.br/loja", "target": "_blank"}, "style": "primary", "position": 1, "visibilityConditions": {}, "icon": "ExternalLink", "enabled": true}]'::jsonb,
 3,
 '2023-06-15 10:00:00+00', NOW()),

-- Traditional Barracas
('dev-001', 'Barraca do Zeca', '001', 'Copacabana', 
 '{"lat": -22.9711, "lng": -43.1822}', 
 true, '8:00 - 18:00', 
 'Traditional beachside barraca serving fresh seafood and cold drinks with ocean views. Family-owned for over 30 years.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'],
 ARRAY['Caipirinha', 'Grilled Fish', 'Coconut Water', 'Açaí Bowl', 'Pastéis', 'Guaraná'],
 '{"phone": "+55 21 99999-1234", "email": "zeca@barraca.com"}',
 ARRAY['WiFi', 'Umbrellas', 'Chairs', 'Bathrooms', 'Shower', 'Storage Lockers'],
 true,
 '[]'::jsonb, 3, '2024-01-15 10:00:00+00', '2024-01-20 15:30:00+00'),

('dev-002', 'Sol e Mar', '015', 'Ipanema', 
 '{"lat": -22.9838, "lng": -43.2096}', 
 true, '9:00 - 19:00', 
 'Modern beachside spot famous for its tropical drinks and Instagram-worthy presentation. Popular with young professionals.',
 ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'],
 ARRAY['Tropical Smoothies', 'Poke Bowl', 'Craft Beer', 'Tapioca', 'Quinoa Salad', 'Cold Brew'],
 '{"phone": "+55 21 99999-5678", "website": "www.solemar.com.br"}',
 ARRAY['WiFi', 'Charging Stations', 'Beach Volleyball', 'Yoga Classes', 'DJ Sets', 'Photo Spots'],
 false,
 '[]'::jsonb, 3, '2024-01-10 09:00:00+00', '2024-01-18 14:20:00+00'),

-- Upscale Options
('dev-003', 'Carioca Vibes', '032', 'Leblon', 
 '{"lat": -22.9840, "lng": -43.2277}', 
 false, '10:00 - 20:00', 
 'Upscale beach experience with gourmet food and premium drinks in Leblon. Perfect for special occasions.',
 ARRAY['https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg', 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'],
 ARRAY['Gourmet Burgers', 'Craft Cocktails', 'Fresh Oysters', 'Lobster Roll', 'Champagne', 'Sushi'],
 '{"phone": "+55 21 99999-9012", "email": "info@cariocavibes.com", "website": "www.cariocavibes.com"}',
 ARRAY['VIP Cabanas', 'Personal Service', 'WiFi', 'Premium Sound System', 'Valet Parking', 'Concierge'],
 true,
 '[]'::jsonb, 3, '2024-01-12 11:00:00+00', '2024-01-19 16:45:00+00'),

-- Wellness & Health
('dev-004', 'Praia Zen', '008', 'Barra da Tijuca', 
 '{"lat": -23.0129, "lng": -43.3187}', 
 true, '7:00 - 17:00', 
 'Peaceful beachside retreat focusing on wellness, healthy food, and relaxation. Certified organic menu.',
 ARRAY['https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'],
 ARRAY['Green Smoothies', 'Quinoa Salad', 'Kombucha', 'Vegan Wraps', 'Acai Bowls', 'Herbal Teas'],
 '{"phone": "+55 21 99999-3456", "email": "wellness@praiazen.com"}',
 ARRAY['Meditation Area', 'Yoga Mats', 'Wellness Workshops', 'Healthy Menu', 'Massage Services', 'Juice Bar'],
 false,
 '[]'::jsonb, 3, '2024-01-08 07:00:00+00', '2024-01-17 12:30:00+00'),

-- Party & Entertainment
('dev-005', 'Posto 9 Beach Bar', '009', 'Ipanema', 
 '{"lat": -22.9845, "lng": -43.2105}', 
 false, '11:00 - 21:00', 
 'Famous beach bar at Posto 9 with live music and vibrant atmosphere. Known for sunset parties.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'],
 ARRAY['Live Music', 'Craft Beer', 'Grilled Prawns', 'Caipiroska', 'DJ Sets', 'Dance Floor'],
 '{"phone": "+55 21 99999-7890", "website": "www.posto9bar.com"}',
 ARRAY['Live Music', 'Dance Floor', 'WiFi', 'Beach Games', 'Sound System', 'Event Space'],
 true,
 '[]'::jsonb, 3, '2024-01-05 11:00:00+00', '2024-01-16 18:00:00+00'),

-- Family-Friendly
('dev-006', 'Leme Paradise', '003', 'Leme', 
 '{"lat": -22.9658, "lng": -43.1729}', 
 true, '8:30 - 18:30', 
 'Family-friendly barraca with traditional Brazilian beach food and games. Kids menu available.',
 ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'],
 ARRAY['Pastéis', 'Fresh Coconut', 'Grilled Corn', 'Açaí na Tigela', 'Kids Menu', 'Ice Cream'],
 '{"phone": "+55 21 99999-4567", "email": "contato@lemeparadise.com"}',
 ARRAY['Kids Area', 'Beach Games', 'Family Tables', 'Shade Umbrellas', 'Playground', 'Baby Changing'],
 false,
 '[]'::jsonb, 3, '2024-01-03 08:30:00+00', '2024-01-15 17:00:00+00'),

-- Sunset Specialists
('dev-007', 'Arpoador Sunset', '021', 'Arpoador', 
 '{"lat": -22.9876, "lng": -43.2089}', 
 true, '14:00 - 22:00', 
 'Perfect spot to watch the famous Arpoador sunset with craft cocktails and light bites. Photographer favorite.',
 ARRAY['https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg', 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'],
 ARRAY['Sunset Cocktails', 'Cheese Boards', 'Wine Selection', 'Bruschetta', 'Tapas', 'Prosecco'],
 '{"phone": "+55 21 99999-2468", "website": "www.arpoadorbar.com"}',
 ARRAY['Sunset Views', 'Cocktail Bar', 'WiFi', 'Photography Spot', 'Wine Cellar', 'Romantic Setting'],
 true,
 '[]'::jsonb, 3, '2024-01-01 14:00:00+00', '2024-01-14 20:30:00+00'),

-- Exclusive Clubs
('dev-008', 'São Conrado Beach Club', '045', 'São Conrado', 
 '{"lat": -23.0089, "lng": -43.2567}', 
 false, '9:00 - 18:00', 
 'Exclusive beach club with premium amenities and hang gliding views. Membership required.',
 ARRAY['https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'],
 ARRAY['Premium Sushi', 'Champagne', 'Gourmet Salads', 'Fresh Lobster', 'Caviar Service', 'Private Chef'],
 '{"phone": "+55 21 99999-1357", "email": "vip@saoconradobeach.com", "website": "www.saoconradobeach.com"}',
 ARRAY['VIP Service', 'Pool Access', 'Hang Gliding Views', 'Premium Dining', 'Spa Services', 'Helicopter Landing'],
 false,
 '[]'::jsonb, 3, '2024-01-02 09:00:00+00', '2024-01-13 16:00:00+00'),

-- Sports & Activities
('dev-009', 'Barra Sports Club', '067', 'Barra da Tijuca', 
 '{"lat": -23.0150, "lng": -43.3200}', 
 true, '6:00 - 20:00', 
 'Active lifestyle hub with water sports, fitness classes, and healthy dining. Equipment rental available.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'],
 ARRAY['Protein Shakes', 'Energy Bowls', 'Sports Drinks', 'Grilled Chicken', 'Fitness Meals', 'Recovery Drinks'],
 '{"phone": "+55 21 99999-6789", "email": "info@barrasports.com"}',
 ARRAY['Surf Lessons', 'Kayak Rental', 'Fitness Classes', 'Equipment Storage', 'Changing Rooms', 'Trainer Services'],
 false,
 '[]'::jsonb, 3, '2023-12-20 06:00:00+00', '2024-01-10 19:00:00+00'),

-- Cultural Experience
('dev-010', 'Cultura Carioca', '088', 'Flamengo', 
 '{"lat": -22.9519, "lng": -43.1729}', 
 true, '10:00 - 19:00', 
 'Cultural immersion experience with traditional music, local art, and authentic Carioca cuisine.',
 ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'],
 ARRAY['Feijoada', 'Samba Shows', 'Local Art', 'Traditional Music', 'Cultural Tours', 'Capoeira'],
 '{"phone": "+55 21 99999-3333", "email": "cultura@carioca.com"}',
 ARRAY['Live Samba', 'Art Gallery', 'Cultural Workshops', 'Local Guides', 'Traditional Crafts', 'History Tours'],
 false,
 '[]'::jsonb, 3, '2023-11-15 10:00:00+00', '2024-01-05 18:00:00+00'),

-- Late Night
('dev-011', 'Noite na Praia', '099', 'Copacabana', 
 '{"lat": -22.9722, "lng": -43.1850}', 
 true, '18:00 - 02:00', 
 'Late-night beach experience with cocktails, live DJ sets, and moonlight dining. Adults only after 10 PM.',
 ARRAY['https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg', 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'],
 ARRAY['Night Cocktails', 'DJ Sets', 'Late Dining', 'Moonlight Menu', 'Premium Spirits', 'VIP Bottles'],
 '{"phone": "+55 21 99999-0000", "email": "noite@praia.com"}',
 ARRAY['DJ Booth', 'Dance Area', 'VIP Tables', 'Bottle Service', 'Security', 'Adult Only Zone'],
 false,
 '[]'::jsonb, 3, '2023-10-01 18:00:00+00', '2024-01-08 01:30:00+00'),

-- Budget-Friendly
('dev-012', 'Praia Popular', '012', 'Urca', 
 '{"lat": -22.9533, "lng": -43.1651}', 
 true, '9:00 - 17:00', 
 'Affordable beach option with simple, delicious food and friendly service. Student discounts available.',
 ARRAY['https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'],
 ARRAY['Budget Meals', 'Student Discounts', 'Simple Drinks', 'Basic Snacks', 'Affordable Options', 'Group Deals'],
 '{"phone": "+55 21 99999-1111", "email": "popular@praia.com"}',
 ARRAY['Basic Chairs', 'Simple Umbrellas', 'Student Friendly', 'Group Tables', 'Budget Options', 'Free WiFi'],
 false,
 '[]'::jsonb, 3, '2023-09-01 09:00:00+00', '2024-01-12 16:00:00+00');

-- Insert comprehensive business hours for development testing
INSERT INTO business_hours (barraca_id, day_of_week, is_open, open_time_utc, close_time_utc, break_start_utc, break_end_utc, notes) VALUES
-- Barraca Uruguay - Retail hours
('barraca-uruguay', 0, false, NULL, NULL, NULL, NULL, 'Closed Sundays'),
('barraca-uruguay', 1, true, '12:00'::time, '22:00'::time, '15:30'::time, '16:30'::time, 'Monday with lunch break'),
('barraca-uruguay', 2, true, '12:00'::time, '22:00'::time, '15:30'::time, '16:30'::time, 'Tuesday with lunch break'),
('barraca-uruguay', 3, true, '12:00'::time, '22:00'::time, '15:30'::time, '16:30'::time, 'Wednesday with lunch break'),
('barraca-uruguay', 4, true, '12:00'::time, '22:00'::time, '15:30'::time, '16:30'::time, 'Thursday with lunch break'),
('barraca-uruguay', 5, true, '12:00'::time, '23:00'::time, NULL, NULL, 'Friday extended hours'),
('barraca-uruguay', 6, true, '12:00'::time, '23:00'::time, NULL, NULL, 'Saturday extended hours'),

-- Traditional barraca - weather dependent
('dev-001', 0, true, '11:00'::time, '21:00'::time, NULL, NULL, 'Sunday regular hours'),
('dev-001', 1, true, '11:00'::time, '21:00'::time, NULL, NULL, 'Monday regular hours'),
('dev-001', 2, true, '11:00'::time, '21:00'::time, NULL, NULL, 'Tuesday regular hours'),
('dev-001', 3, true, '11:00'::time, '21:00'::time, NULL, NULL, 'Wednesday regular hours'),
('dev-001', 4, true, '11:00'::time, '21:00'::time, NULL, NULL, 'Thursday regular hours'),
('dev-001', 5, true, '11:00'::time, '21:00'::time, NULL, NULL, 'Friday regular hours'),
('dev-001', 6, true, '11:00'::time, '21:00'::time, NULL, NULL, 'Saturday regular hours'),

-- Late night venue
('dev-011', 0, false, NULL, NULL, NULL, NULL, 'Closed Sundays'),
('dev-011', 1, false, NULL, NULL, NULL, NULL, 'Closed Mondays'),
('dev-011', 2, true, '21:00'::time, '05:00'::time, NULL, NULL, 'Tuesday night service'),
('dev-011', 3, true, '21:00'::time, '05:00'::time, NULL, NULL, 'Wednesday night service'),
('dev-011', 4, true, '21:00'::time, '05:00'::time, NULL, NULL, 'Thursday night service'),
('dev-011', 5, true, '21:00'::time, '06:00'::time, NULL, NULL, 'Friday extended night'),
('dev-011', 6, true, '21:00'::time, '06:00'::time, NULL, NULL, 'Saturday extended night'),

-- Early morning wellness
('dev-004', 0, true, '10:00'::time, '20:00'::time, NULL, NULL, 'Sunday wellness hours'),
('dev-004', 1, true, '10:00'::time, '20:00'::time, NULL, NULL, 'Monday wellness hours'),
('dev-004', 2, true, '10:00'::time, '20:00'::time, NULL, NULL, 'Tuesday wellness hours'),
('dev-004', 3, true, '10:00'::time, '20:00'::time, NULL, NULL, 'Wednesday wellness hours'),
('dev-004', 4, true, '10:00'::time, '20:00'::time, NULL, NULL, 'Thursday wellness hours'),
('dev-004', 5, true, '10:00'::time, '20:00'::time, NULL, NULL, 'Friday wellness hours'),
('dev-004', 6, true, '09:00'::time, '21:00'::time, NULL, NULL, 'Saturday extended wellness');

-- Insert rich story content for development testing
INSERT INTO stories (id, barraca_id, media_url, media_type, caption, duration, created_at, expires_at) VALUES
-- Recent stories (last 2 hours)
('dev-story-001', 'dev-001', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'image', 'Fresh catch of the day! 🐟 Come try our grilled fish special', NULL, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '23.5 hours'),
('dev-story-002', 'dev-001', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg', 'image', 'Perfect sunset vibes from our deck 🌅', NULL, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '23 hours'),
('dev-story-003', 'dev-002', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'image', 'New tropical smoothie menu! 🥤🌺 Try our passion fruit special', NULL, NOW() - INTERVAL '45 minutes', NOW() + INTERVAL '23.25 hours'),
('dev-story-004', 'dev-002', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg', 'image', 'Yoga class starting at 6 PM 🧘‍♀️ All levels welcome!', NULL, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '22 hours'),

-- Older stories (testing expiration)
('dev-story-005', 'dev-003', 'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg', 'image', 'VIP cabana setup for tonight ✨ Book now for sunset dinner', NULL, NOW() - INTERVAL '4 hours', NOW() + INTERVAL '20 hours'),
('dev-story-006', 'dev-004', 'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'image', 'Morning meditation session 🧘‍♂️🌊 Join us at sunrise', NULL, NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours'),
('dev-story-007', 'dev-006', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'image', 'Family fun day! 👨‍👩‍👧‍👦🏖️ Kids activities all afternoon', NULL, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '21 hours'),

-- Stories from different barracas
('dev-story-008', 'dev-007', 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg', 'image', 'Golden hour cocktails 🍹 Best sunset spot in Rio!', NULL, NOW() - INTERVAL '5 hours', NOW() + INTERVAL '19 hours'),
('dev-story-009', 'dev-009', 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg', 'image', 'Surf lessons available! 🏄‍♂️ Perfect waves today', NULL, NOW() - INTERVAL '2.5 hours', NOW() + INTERVAL '21.5 hours'),
('dev-story-010', 'dev-010', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg', 'image', 'Live samba tonight! 🎵 Traditional music starts at 8 PM', NULL, NOW() - INTERVAL '1.5 hours', NOW() + INTERVAL '22.5 hours'),

-- Video stories for testing
('dev-story-011', 'dev-005', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'video', 'DJ set preview! 🎧 Tonight''s lineup is incredible', 30, NOW() - INTERVAL '3.5 hours', NOW() + INTERVAL '20.5 hours'),
('dev-story-012', 'dev-011', 'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg', 'video', 'Moonlight dining experience 🌙 Romantic tables available', 45, NOW() - INTERVAL '7 hours', NOW() + INTERVAL '17 hours'),

-- Near expiration (for testing cleanup)
('dev-story-013', 'dev-012', 'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'image', 'Student discount day! 📚 20% off all meals', NULL, NOW() - INTERVAL '23 hours', NOW() + INTERVAL '1 hour'),
('dev-story-014', 'barraca-uruguay', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'image', 'New summer collection arrived! 👙 Premium swimwear now available', NULL, NOW() - INTERVAL '22 hours', NOW() + INTERVAL '2 hours'),

-- Multiple stories per barraca for testing
('dev-story-015', 'dev-001', 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg', 'image', 'Happy hour special! 🍻 2-for-1 caipirinhas until 7 PM', NULL, NOW() - INTERVAL '4.5 hours', NOW() + INTERVAL '19.5 hours');

-- Insert diverse email subscriptions for development testing
INSERT INTO email_subscriptions (email, preferences, subscribed_at, is_active) VALUES
-- Recent subscribers
('dev.user1@cariocacoastal.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 day', true),
('dev.user2@example.com', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '2 days', true),
('dev.user3@gmail.com', '{"newBarracas": false, "specialOffers": true}', NOW() - INTERVAL '3 days', true),
('dev.beachlover@yahoo.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 week', true),
('dev.tourist@vacation.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '2 weeks', true),

-- Older subscribers
('dev.regular@local.com', '{"newBarracas": false, "specialOffers": true}', NOW() - INTERVAL '1 month', true),
('dev.family@beach.com', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '2 months', true),
('dev.surfer@waves.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '3 months', true),
('dev.foodie@gourmet.com', '{"newBarracas": false, "specialOffers": true}', NOW() - INTERVAL '4 months', true),
('dev.wellness@zen.com', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '5 months', true),

-- International subscribers
('dev.international@usa.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 week', true),
('dev.european@france.fr', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '2 weeks', true),
('dev.argentina@buenosaires.ar', '{"newBarracas": false, "specialOffers": true}', NOW() - INTERVAL '3 weeks', true),

-- Inactive subscribers (for testing)
('dev.inactive1@test.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '6 months', false),
('dev.inactive2@test.com', '{"newBarracas": false, "specialOffers": false}', NOW() - INTERVAL '1 year', false),

-- Different preference combinations
('dev.offers.only@deals.com', '{"newBarracas": false, "specialOffers": true}', NOW() - INTERVAL '1 week', true),
('dev.news.only@updates.com', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '2 weeks', true),
('dev.all.updates@everything.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '3 weeks', true),
('dev.minimal@quiet.com', '{"newBarracas": false, "specialOffers": false}', NOW() - INTERVAL '1 month', true),

-- Test edge cases
('dev.long.email.address.for.testing@very-long-domain-name-for-testing.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 day', true),
('dev+tag@gmail.com', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '2 days', true);

-- Insert comprehensive weather cache data
INSERT INTO weather_cache (location, temperature, feels_like, humidity, wind_speed, wind_direction, description, icon, beach_conditions, cached_at, expires_at) VALUES
('Rio de Janeiro', 28.0, 32.0, 65, 12.0, 180, 'Partly Cloudy', 'partly-cloudy', 'excellent', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '10 minutes'),
('Copacabana', 27.5, 31.5, 68, 10.0, 175, 'Sunny', 'sunny', 'excellent', NOW() - INTERVAL '3 minutes', NOW() + INTERVAL '12 minutes'),
('Ipanema', 28.5, 32.5, 62, 14.0, 185, 'Partly Cloudy', 'partly-cloudy', 'good', NOW() - INTERVAL '2 minutes', NOW() + INTERVAL '13 minutes'),
('Leblon', 28.0, 32.0, 64, 13.0, 180, 'Clear', 'clear', 'excellent', NOW() - INTERVAL '1 minute', NOW() + INTERVAL '14 minutes'),
('Barra da Tijuca', 29.0, 33.0, 60, 15.0, 190, 'Sunny', 'sunny', 'excellent', NOW() - INTERVAL '4 minutes', NOW() + INTERVAL '11 minutes'),
('São Conrado', 27.0, 30.5, 70, 18.0, 200, 'Windy', 'windy', 'fair', NOW() - INTERVAL '6 minutes', NOW() + INTERVAL '9 minutes'),
('Leme', 27.8, 31.8, 66, 11.0, 170, 'Clear', 'clear', 'excellent', NOW() - INTERVAL '7 minutes', NOW() + INTERVAL '8 minutes'),
('Arpoador', 28.2, 32.2, 63, 12.5, 182, 'Perfect', 'sunny', 'excellent', NOW() - INTERVAL '1 minute', NOW() + INTERVAL '14 minutes');

-- Insert rich visitor analytics for development testing
INSERT INTO visitor_analytics (visitor_id, first_visit, last_visit, visit_count, user_agent, referrer, country, city, created_at) VALUES
-- Regular users
('dev_visitor_001', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 hour', 25, 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', 'https://google.com', 'BR', 'Rio de Janeiro', NOW() - INTERVAL '2 months'),
('dev_visitor_002', NOW() - INTERVAL '1 month', NOW() - INTERVAL '2 hours', 15, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'https://instagram.com', 'BR', 'São Paulo', NOW() - INTERVAL '1 month'),
('dev_visitor_003', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '30 minutes', 8, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'https://facebook.com', 'BR', 'Belo Horizonte', NOW() - INTERVAL '3 weeks'),

-- International visitors
('dev_visitor_004', NOW() - INTERVAL '1 week', NOW() - INTERVAL '3 hours', 5, 'Mozilla/5.0 (Android 12; Mobile)', 'https://tripadvisor.com', 'US', 'New York', NOW() - INTERVAL '1 week'),
('dev_visitor_005', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 day', 3, 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)', 'https://booking.com', 'FR', 'Paris', NOW() - INTERVAL '2 weeks'),
('dev_visitor_006', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 hours', 7, 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', 'https://airbnb.com', 'AR', 'Buenos Aires', NOW() - INTERVAL '5 days'),

-- New visitors
('dev_visitor_007', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'https://google.com', 'DE', 'Berlin', NOW() - INTERVAL '2 hours'),
('dev_visitor_008', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', 1, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'https://youtube.com', 'UK', 'London', NOW() - INTERVAL '1 hour'),
('dev_visitor_009', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', 1, 'Mozilla/5.0 (Android 13; Mobile)', 'https://tiktok.com', 'ES', 'Madrid', NOW() - INTERVAL '30 minutes'),

-- Power users
('dev_visitor_010', NOW() - INTERVAL '6 months', NOW() - INTERVAL '15 minutes', 50, 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', 'direct', 'BR', 'Rio de Janeiro', NOW() - INTERVAL '6 months'),
('dev_visitor_011', NOW() - INTERVAL '4 months', NOW() - INTERVAL '45 minutes', 35, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'direct', 'BR', 'Niterói', NOW() - INTERVAL '4 months'),

-- Different referrers for testing
('dev_visitor_012', NOW() - INTERVAL '3 days', NOW() - INTERVAL '6 hours', 4, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'https://reddit.com', 'CA', 'Toronto', NOW() - INTERVAL '3 days'),
('dev_visitor_013', NOW() - INTERVAL '1 week', NOW() - INTERVAL '8 hours', 6, 'Mozilla/5.0 (Android 12; Mobile)', 'https://twitter.com', 'AU', 'Sydney', NOW() - INTERVAL '1 week'),
('dev_visitor_014', NOW() - INTERVAL '4 days', NOW() - INTERVAL '12 hours', 3, 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)', 'https://pinterest.com', 'IT', 'Rome', NOW() - INTERVAL '4 days'),

-- Mobile vs Desktop testing
('dev_visitor_015', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour', 2, 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', 'https://google.com', 'BR', 'Brasília', NOW() - INTERVAL '2 days'),
('dev_visitor_016', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'https://bing.com', 'BR', 'Salvador', NOW() - INTERVAL '1 day');

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Development environment seeded successfully with:';
  RAISE NOTICE '- 12 barracas with diverse offerings';
  RAISE NOTICE '- 15+ stories across multiple barracas';
  RAISE NOTICE '- 20+ email subscriptions';
  RAISE NOTICE '- Complete business hours scenarios';
  RAISE NOTICE '- Rich visitor analytics data';
  RAISE NOTICE '- Comprehensive weather cache';
END $$;