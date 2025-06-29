/*
  # Seed Data for Carioca Coastal Club

  1. Insert sample barracas data
  2. Insert sample stories
  3. Insert sample email subscriptions
  4. Insert initial weather cache data

  This migration populates the database with realistic data for development and demo purposes.
*/

-- Insert barracas data (migrated from mock data)
INSERT INTO barracas (id, name, barraca_number, location, coordinates, is_open, typical_hours, description, images, menu_preview, contact, amenities, weather_dependent, cta_buttons, created_at, updated_at) VALUES

-- Barraca Uruguay (Premium retail)
('barraca-uruguay', 'Barraca Uruguay', '203', 'Ipanema', 
 '{"lat": -22.9838, "lng": -43.2096}', 
 true, '09:00 - 19:00', 
 'Premium beachwear boutique offering curated selection of high-quality swimwear, beach accessories, and lifestyle products. Specializing in Brazilian beach fashion with international quality standards.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'],
 ARRAY['Premium Swimwear', 'Designer Sunglasses', 'Beach Accessories', 'Sun Protection', 'Lifestyle Products'],
 '{"phone": "+55 21 99237-1601", "email": "contato@barracauruguay.com.br", "website": "https://instagram.com/barraca_uruguay"}',
 ARRAY['Personal Shopper', 'Gift Wrapping', 'Size Consultation', 'Product Customization', 'VIP Fitting Room', 'Delivery Service', 'Loyalty Program', 'Style Advisory'],
 false,
 '[{"id": "shop-online", "text": "Loja Online", "action": {"type": "url", "value": "https://barracauruguay.com.br/loja", "target": "_blank", "trackingEvent": "online_store_clicked"}, "style": "primary", "position": 1, "visibilityConditions": {}, "icon": "ExternalLink", "enabled": true}, {"id": "whatsapp-catalog", "text": "Catálogo", "action": {"type": "whatsapp", "value": "+55 21 99237-1601", "trackingEvent": "whatsapp_catalog_clicked"}, "style": "secondary", "position": 2, "visibilityConditions": {"timeRestrictions": {"startTime": "09:00", "endTime": "19:00", "daysOfWeek": [1, 2, 3, 4, 5, 6]}}, "icon": "MessageCircle", "enabled": true}]',
 '2023-06-15 10:00:00+00', NOW()),

-- Barraca do Zeca (Traditional)
('1', 'Barraca do Zeca', '001', 'Copacabana', 
 '{"lat": -22.9711, "lng": -43.1822}', 
 true, '8:00 - 18:00', 
 'Traditional beachside barraca serving fresh seafood and cold drinks with ocean views.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'],
 ARRAY['Caipirinha', 'Grilled Fish', 'Coconut Water', 'Açaí Bowl'],
 '{"phone": "+55 21 99999-1234", "email": "zeca@barraca.com"}',
 ARRAY['WiFi', 'Umbrellas', 'Chairs', 'Bathrooms'],
 true,
 '[{"id": "reserve-premium", "text": "Reserve VIP", "action": {"type": "url", "value": "/reserve/vip", "target": "_blank", "trackingEvent": "vip_reservation_clicked"}, "style": "primary", "position": 1, "visibilityConditions": {"requiresOpen": true, "memberOnly": true}, "icon": "Star", "enabled": true}]',
 '2024-01-15 10:00:00+00', '2024-01-20 15:30:00+00'),

-- Sol e Mar (Modern)
('2', 'Sol e Mar', '015', 'Ipanema', 
 '{"lat": -22.9838, "lng": -43.2096}', 
 true, '9:00 - 19:00', 
 'Modern beachside spot famous for its tropical drinks and Instagram-worthy presentation.',
 ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'],
 ARRAY['Tropical Smoothies', 'Poke Bowl', 'Craft Beer', 'Tapioca'],
 '{"phone": "+55 21 99999-5678", "website": "www.solemar.com.br"}',
 ARRAY['WiFi', 'Charging Stations', 'Beach Volleyball', 'Yoga Classes'],
 false,
 '[{"id": "book-yoga", "text": "Book Yoga", "action": {"type": "url", "value": "/yoga/booking", "target": "_blank", "trackingEvent": "yoga_booking_clicked"}, "style": "secondary", "position": 1, "visibilityConditions": {"requiresOpen": true, "timeRestrictions": {"startTime": "06:00", "endTime": "10:00"}}, "icon": "Calendar", "enabled": true}]',
 '2024-01-10 09:00:00+00', '2024-01-18 14:20:00+00'),

-- Carioca Vibes (Upscale)
('3', 'Carioca Vibes', '032', 'Leblon', 
 '{"lat": -22.9840, "lng": -43.2277}', 
 false, '10:00 - 20:00', 
 'Upscale beach experience with gourmet food and premium drinks in Leblon.',
 ARRAY['https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg', 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'],
 ARRAY['Gourmet Burgers', 'Craft Cocktails', 'Fresh Oysters', 'Lobster Roll'],
 '{"phone": "+55 21 99999-9012", "email": "info@cariocavibes.com", "website": "www.cariocavibes.com"}',
 ARRAY['VIP Cabanas', 'Personal Service', 'WiFi', 'Premium Sound System'],
 true,
 '[]',
 '2024-01-12 11:00:00+00', '2024-01-19 16:45:00+00'),

-- Praia Zen (Wellness)
('4', 'Praia Zen', '008', 'Barra da Tijuca', 
 '{"lat": -23.0129, "lng": -43.3187}', 
 true, '7:00 - 17:00', 
 'Peaceful beachside retreat focusing on wellness, healthy food, and relaxation.',
 ARRAY['https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'],
 ARRAY['Green Smoothies', 'Quinoa Salad', 'Kombucha', 'Vegan Wraps'],
 '{"phone": "+55 21 99999-3456", "email": "wellness@praiazen.com"}',
 ARRAY['Meditation Area', 'Yoga Mats', 'Wellness Workshops', 'Healthy Menu'],
 false,
 '[]',
 '2024-01-08 07:00:00+00', '2024-01-17 12:30:00+00'),

-- Posto 9 Beach Bar (Party)
('5', 'Posto 9 Beach Bar', '009', 'Ipanema', 
 '{"lat": -22.9845, "lng": -43.2105}', 
 false, '11:00 - 21:00', 
 'Famous beach bar at Posto 9 with live music and vibrant atmosphere.',
 ARRAY['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'],
 ARRAY['Live Music', 'Craft Beer', 'Grilled Prawns', 'Caipiroska'],
 '{"phone": "+55 21 99999-7890", "website": "www.posto9bar.com"}',
 ARRAY['Live Music', 'Dance Floor', 'WiFi', 'Beach Games'],
 true,
 '[]',
 '2024-01-05 11:00:00+00', '2024-01-16 18:00:00+00'),

-- Leme Paradise (Family)
('6', 'Leme Paradise', '003', 'Leme', 
 '{"lat": -22.9658, "lng": -43.1729}', 
 true, '8:30 - 18:30', 
 'Family-friendly barraca with traditional Brazilian beach food and games.',
 ARRAY['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'],
 ARRAY['Pastéis', 'Fresh Coconut', 'Grilled Corn', 'Açaí na Tigela'],
 '{"phone": "+55 21 99999-4567", "email": "contato@lemeparadise.com"}',
 ARRAY['Kids Area', 'Beach Games', 'Family Tables', 'Shade Umbrellas'],
 false,
 '[]',
 '2024-01-03 08:30:00+00', '2024-01-15 17:00:00+00'),

-- Arpoador Sunset (Sunset Views)
('7', 'Arpoador Sunset', '021', 'Arpoador', 
 '{"lat": -22.9876, "lng": -43.2089}', 
 true, '14:00 - 22:00', 
 'Perfect spot to watch the famous Arpoador sunset with craft cocktails and light bites.',
 ARRAY['https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg', 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'],
 ARRAY['Sunset Cocktails', 'Cheese Boards', 'Wine Selection', 'Bruschetta'],
 '{"phone": "+55 21 99999-2468", "website": "www.arpoadorbar.com"}',
 ARRAY['Sunset Views', 'Cocktail Bar', 'WiFi', 'Photography Spot'],
 true,
 '[]',
 '2024-01-01 14:00:00+00', '2024-01-14 20:30:00+00'),

-- São Conrado Beach Club (Exclusive)
('8', 'São Conrado Beach Club', '045', 'São Conrado', 
 '{"lat": -23.0089, "lng": -43.2567}', 
 false, '9:00 - 18:00', 
 'Exclusive beach club with premium amenities and hang gliding views.',
 ARRAY['https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'],
 ARRAY['Premium Sushi', 'Champagne', 'Gourmet Salads', 'Fresh Lobster'],
 '{"phone": "+55 21 99999-1357", "email": "vip@saoconradobeach.com", "website": "www.saoconradobeach.com"}',
 ARRAY['VIP Service', 'Pool Access', 'Hang Gliding Views', 'Premium Dining'],
 false,
 '[]',
 '2024-01-02 09:00:00+00', '2024-01-13 16:00:00+00');

-- Insert sample stories
INSERT INTO stories (id, barraca_id, media_url, media_type, caption, created_at, expires_at) VALUES
('story-1', '1', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'image', 'Fresh seafood just arrived! 🦐🐟', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '23.5 hours'),
('story-2', '1', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg', 'image', 'Beautiful sunset from our deck 🌅', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '22 hours'),
('story-3', '2', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'image', 'New tropical smoothie menu! 🥤🌺', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '23 hours'),
('story-4', '2', 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg', 'image', 'Yoga class starting at 6 PM 🧘‍♀️', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '23.5 hours'),
('story-5', '3', 'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg', 'image', 'VIP cabana setup for tonight 🏖️✨', NOW() - INTERVAL '45 minutes', NOW() + INTERVAL '23.25 hours'),
('story-6', '4', 'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg', 'image', 'Morning meditation session 🧘‍♂️🌊', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '20 hours'),
('story-7', '6', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg', 'image', 'Family fun day at the beach! 👨‍👩‍👧‍👦🏖️', NOW() - INTERVAL '1.5 hours', NOW() + INTERVAL '22.5 hours');

-- Insert sample email subscriptions
INSERT INTO email_subscriptions (email, preferences, subscribed_at) VALUES
('demo@cariocacoastal.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '1 week'),
('user1@example.com', '{"newBarracas": true, "specialOffers": false}', NOW() - INTERVAL '3 days'),
('user2@example.com', '{"newBarracas": false, "specialOffers": true}', NOW() - INTERVAL '1 day'),
('beachlover@gmail.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '2 weeks'),
('tourist@vacation.com', '{"newBarracas": true, "specialOffers": true}', NOW() - INTERVAL '5 days');

-- Insert initial weather cache data
INSERT INTO weather_cache (location, temperature, feels_like, humidity, wind_speed, wind_direction, description, icon, beach_conditions, cached_at, expires_at) VALUES
('Rio de Janeiro', 28.0, 32.0, 65, 12.0, 180, 'Partly Cloudy', 'partly-cloudy', 'excellent', NOW(), NOW() + INTERVAL '15 minutes'),
('Copacabana', 27.5, 31.5, 68, 10.0, 175, 'Sunny', 'sunny', 'excellent', NOW(), NOW() + INTERVAL '15 minutes'),
('Ipanema', 28.5, 32.5, 62, 14.0, 185, 'Partly Cloudy', 'partly-cloudy', 'good', NOW(), NOW() + INTERVAL '15 minutes'),
('Leblon', 28.0, 32.0, 64, 13.0, 180, 'Clear', 'clear', 'excellent', NOW(), NOW() + INTERVAL '15 minutes');

-- Insert sample visitor analytics
INSERT INTO visitor_analytics (visitor_id, first_visit, last_visit, visit_count, user_agent, country, city) VALUES
('visitor_001', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 day', 5, 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', 'BR', 'Rio de Janeiro'),
('visitor_002', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours', 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'US', 'New York'),
('visitor_003', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 week', 8, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'BR', 'São Paulo'),
('visitor_004', NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 minutes', 2, 'Mozilla/5.0 (Android 12; Mobile)', 'AR', 'Buenos Aires'),
('visitor_005', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 hour', 4, 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)', 'FR', 'Paris');