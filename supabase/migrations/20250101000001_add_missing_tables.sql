-- Migration: Add Missing Tables
-- Description: Adds missing tables that were referenced in TRUNCATE statements
-- Date: 2025-01-01

-- Create weather_cache table
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT NOT NULL,
    temperature DECIMAL(4,1),
    feels_like DECIMAL(4,1),
    humidity INTEGER,
    wind_speed DECIMAL(4,1),
    wind_direction INTEGER,
    description TEXT,
    icon TEXT,
    beach_conditions TEXT,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes'
);

-- Create email_subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    preferences JSONB DEFAULT '{"newBarracas": true, "specialOffers": true}',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    barraca_id TEXT NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    duration INTEGER, -- in seconds, for videos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Create business_hours table
CREATE TABLE IF NOT EXISTS business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barraca_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_open BOOLEAN DEFAULT true,
    open_time_utc TIME,
    close_time_utc TIME,
    break_start_utc TIME,
    break_end_utc TIME,
    notes TEXT
);

-- Create barracas table
CREATE TABLE IF NOT EXISTS barracas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    barraca_number TEXT,
    location TEXT NOT NULL,
    coordinates JSONB NOT NULL,
    is_open BOOLEAN DEFAULT true,
    typical_hours TEXT,
    description TEXT,
    images TEXT[],
    menu_preview TEXT[],
    contact JSONB,
    amenities TEXT[],
    weather_dependent BOOLEAN DEFAULT false,
    cta_buttons JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visitor_analytics table
CREATE TABLE IF NOT EXISTS visitor_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_count INTEGER DEFAULT 1,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON weather_cache(location);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at ON weather_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_is_active ON email_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_stories_barraca_id ON stories(barraca_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_business_hours_barraca_id ON business_hours(barraca_id);
CREATE INDEX IF NOT EXISTS idx_business_hours_day ON business_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visitor_id ON visitor_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_last_visit ON visitor_analytics(last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_country ON visitor_analytics(country);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_city ON visitor_analytics(city);

-- Add RLS policies
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE barracas ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Weather cache policies
CREATE POLICY "Public can read weather cache" ON weather_cache
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert weather cache" ON weather_cache
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Email subscriptions policies
CREATE POLICY "Public can insert email subscriptions" ON email_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read email subscriptions" ON email_subscriptions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Stories policies
CREATE POLICY "Public can read stories" ON stories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage stories" ON stories
    FOR ALL USING (auth.role() = 'authenticated');

-- Business hours policies
CREATE POLICY "Public can read business hours" ON business_hours
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage business hours" ON business_hours
    FOR ALL USING (auth.role() = 'authenticated');

-- Barracas policies
CREATE POLICY "Public can read barracas" ON barracas
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage barracas" ON barracas
    FOR ALL USING (auth.role() = 'authenticated');

-- Visitor analytics policies
CREATE POLICY "Public can insert visitor analytics" ON visitor_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read visitor analytics" ON visitor_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Add updated_at triggers
CREATE TRIGGER update_weather_cache_updated_at 
    BEFORE UPDATE ON weather_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barracas_updated_at 
    BEFORE UPDATE ON barracas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitor_analytics_updated_at 
    BEFORE UPDATE ON visitor_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 