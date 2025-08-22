-- Ensure barraca_registrations table allows public access for submissions
-- This migration ensures that the registration form works in production

-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS barraca_registrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  barraca_number TEXT,
  location TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  typical_hours TEXT NOT NULL,
  description TEXT NOT NULL,
  nearest_posto TEXT,
  contact JSONB NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  environment TEXT[] DEFAULT '{}',
  default_photo TEXT,
  weekend_hours_enabled BOOLEAN DEFAULT false,
  weekend_hours JSONB,
  additional_info TEXT,
  -- Partnership opportunities
  qr_codes BOOLEAN DEFAULT false,
  repeat_discounts BOOLEAN DEFAULT false,
  hotel_partnerships BOOLEAN DEFAULT false,
  content_creation BOOLEAN DEFAULT false,
  online_orders BOOLEAN DEFAULT false,
  -- Contact preferences for photos and status updates
  contact_for_photos BOOLEAN DEFAULT false,
  contact_for_status BOOLEAN DEFAULT false,
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('whatsapp', 'instagram', 'email')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_barraca_registrations_status ON barraca_registrations(status);
CREATE INDEX IF NOT EXISTS idx_barraca_registrations_submitted_at ON barraca_registrations(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_barraca_registrations_location ON barraca_registrations(location);

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_barraca_registrations_updated_at ON barraca_registrations;
CREATE TRIGGER update_barraca_registrations_updated_at 
    BEFORE UPDATE ON barraca_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE barraca_registrations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public to insert barraca registrations" ON barraca_registrations;
DROP POLICY IF EXISTS "Allow public to read registrations" ON barraca_registrations;
DROP POLICY IF EXISTS "Allow public to read own registrations" ON barraca_registrations;
DROP POLICY IF EXISTS "Allow admins to read all registrations" ON barraca_registrations;
DROP POLICY IF EXISTS "Allow admins to update registrations" ON barraca_registrations;
DROP POLICY IF EXISTS "Allow admins to delete registrations" ON barraca_registrations;

-- Create policies that work without authentication for public submissions
-- Allow anyone to insert registrations (no auth required)
CREATE POLICY "Allow public to insert barraca registrations" ON barraca_registrations
    FOR INSERT WITH CHECK (true);

-- Allow public to read registrations (for now, we can restrict this later if needed)
CREATE POLICY "Allow public to read registrations" ON barraca_registrations
    FOR SELECT USING (true);

-- Allow admins to update registrations (when authenticated)
CREATE POLICY "Allow admins to update registrations" ON barraca_registrations
    FOR UPDATE USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superuser'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR current_setting('request.jwt.claims', true) IS NULL
    );

-- Allow admins to delete registrations (when authenticated)
CREATE POLICY "Allow admins to delete registrations" ON barraca_registrations
    FOR DELETE USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superuser'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR current_setting('request.jwt.claims', true) IS NULL
    );

-- Add a comment to document the purpose
COMMENT ON TABLE barraca_registrations IS 'Public registration form for beach barracas - allows unauthenticated submissions';
