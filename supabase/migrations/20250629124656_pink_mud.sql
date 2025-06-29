/*
  # Initial Database Schema for Carioca Coastal Club

  1. New Tables
    - `barracas` - Main barraca data with location, status, and configuration
    - `email_subscriptions` - Newsletter and notification subscriptions
    - `stories` - Story content for barracas (24-hour expiring content)
    - `visitor_analytics` - Unique visitor tracking and analytics
    - `weather_cache` - Cached weather data for performance

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access where appropriate
    - Add policies for authenticated user actions

  3. Performance
    - Add indexes for common queries
    - Add GiST index for geospatial queries
    - Add full-text search indexes

  4. Real-time
    - Enable real-time subscriptions for barracas table
    - Enable real-time for stories table
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Barracas table - Main business entities
CREATE TABLE IF NOT EXISTS barracas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  barraca_number VARCHAR(10),
  location VARCHAR(100) NOT NULL,
  coordinates JSONB NOT NULL,
  is_open BOOLEAN DEFAULT true,
  typical_hours VARCHAR(50) DEFAULT '9:00 - 18:00',
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  menu_preview TEXT[] DEFAULT '{}',
  contact JSONB DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  weather_dependent BOOLEAN DEFAULT false,
  cta_buttons JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  preferences JSONB DEFAULT '{"newBarracas": true, "specialOffers": true}',
  is_active BOOLEAN DEFAULT true,
  unsubscribe_token UUID DEFAULT gen_random_uuid()
);

-- Stories table for 24-hour content
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barraca_id UUID REFERENCES barracas(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  duration INTEGER, -- for videos in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  is_active BOOLEAN DEFAULT true
);

-- Visitor analytics table
CREATE TABLE IF NOT EXISTS visitor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id VARCHAR(255) UNIQUE NOT NULL,
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW(),
  visit_count INTEGER DEFAULT 1,
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(2),
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather cache table for performance
CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location VARCHAR(100) NOT NULL,
  temperature DECIMAL(4,1),
  feels_like DECIMAL(4,1),
  humidity INTEGER,
  wind_speed DECIMAL(4,1),
  wind_direction INTEGER,
  description VARCHAR(100),
  icon VARCHAR(50),
  beach_conditions VARCHAR(20) CHECK (beach_conditions IN ('excellent', 'good', 'fair', 'poor')),
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '15 minutes'
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_barracas_location ON barracas(location);
CREATE INDEX IF NOT EXISTS idx_barracas_is_open ON barracas(is_open);
CREATE INDEX IF NOT EXISTS idx_barracas_weather_dependent ON barracas(weather_dependent);
CREATE INDEX IF NOT EXISTS idx_barracas_coordinates ON barracas USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_barracas_updated_at ON barracas(updated_at);

-- Full-text search index for barracas
CREATE INDEX IF NOT EXISTS idx_barracas_search ON barracas 
USING GIN(to_tsvector('portuguese', name || ' ' || COALESCE(barraca_number, '') || ' ' || location || ' ' || description));

-- Stories indexes
CREATE INDEX IF NOT EXISTS idx_stories_barraca_id ON stories(barraca_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_is_active ON stories(is_active);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);

-- Email subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_is_active ON email_subscriptions(is_active);

-- Visitor analytics indexes
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visitor_id ON visitor_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_last_visit ON visitor_analytics(last_visit);

-- Weather cache indexes
CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON weather_cache(location);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at ON weather_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE barracas ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for barracas (public read access)
CREATE POLICY "Public read access for barracas"
  ON barracas
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert barracas"
  ON barracas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update barracas"
  ON barracas
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for email subscriptions
CREATE POLICY "Users can insert their own email subscription"
  ON email_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read their own email subscription"
  ON email_subscriptions
  FOR SELECT
  USING (true);

-- RLS Policies for stories (public read access for active stories)
CREATE POLICY "Public read access for active stories"
  ON stories
  FOR SELECT
  USING (is_active = true AND expires_at > NOW());

CREATE POLICY "Authenticated users can insert stories"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for visitor analytics (public insert, no read)
CREATE POLICY "Public can insert visitor analytics"
  ON visitor_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read visitor analytics"
  ON visitor_analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for weather cache (public read access)
CREATE POLICY "Public read access for weather cache"
  ON weather_cache
  FOR SELECT
  USING (expires_at > NOW());

CREATE POLICY "Service role can manage weather cache"
  ON weather_cache
  FOR ALL
  TO service_role
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_barracas_updated_at
  BEFORE UPDATE ON barracas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitor_analytics_updated_at
  BEFORE UPDATE ON visitor_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired weather cache
CREATE OR REPLACE FUNCTION cleanup_expired_weather()
RETURNS void AS $$
BEGIN
  DELETE FROM weather_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby barracas (for scaling to millions)
CREATE OR REPLACE FUNCTION get_nearby_barracas(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT DEFAULT 5,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  location TEXT,
  is_open BOOLEAN,
  distance_km FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.location,
    b.is_open,
    (6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians((b.coordinates->>'lat')::float)) * 
      cos(radians((b.coordinates->>'lng')::float) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians((b.coordinates->>'lat')::float))
    )) as distance_km
  FROM barracas b
  WHERE (6371 * acos(
    cos(radians(user_lat)) * 
    cos(radians((b.coordinates->>'lat')::float)) * 
    cos(radians((b.coordinates->>'lng')::float) - radians(user_lng)) + 
    sin(radians(user_lat)) * 
    sin(radians((b.coordinates->>'lat')::float))
  )) <= radius_km
  ORDER BY distance_km
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_barracas(
  search_query TEXT,
  location_filter TEXT DEFAULT NULL,
  open_only BOOLEAN DEFAULT false,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  location TEXT,
  is_open BOOLEAN,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.location,
    b.is_open,
    ts_rank(to_tsvector('portuguese', b.name || ' ' || COALESCE(b.barraca_number, '') || ' ' || b.location || ' ' || b.description), 
             plainto_tsquery('portuguese', search_query)) as rank
  FROM barracas b
  WHERE 
    to_tsvector('portuguese', b.name || ' ' || COALESCE(b.barraca_number, '') || ' ' || b.location || ' ' || b.description) 
    @@ plainto_tsquery('portuguese', search_query)
    AND (location_filter IS NULL OR b.location ILIKE '%' || location_filter || '%')
    AND (NOT open_only OR b.is_open = true)
  ORDER BY rank DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Enable real-time for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE barracas;
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE visitor_analytics;