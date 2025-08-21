-- Create barraca_registrations table
CREATE TABLE IF NOT EXISTS barraca_registrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_barraca_registrations_updated_at 
    BEFORE UPDATE ON barraca_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE barraca_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public to insert registrations (no auth required)
CREATE POLICY "Allow public to insert barraca registrations" ON barraca_registrations
    FOR INSERT WITH CHECK (true);

-- Allow public to read their own registrations (by email)
CREATE POLICY "Allow public to read own registrations" ON barraca_registrations
    FOR SELECT USING (
        contact->>'email' = current_setting('request.jwt.claims', true)::json->>'email'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superuser'
    );

-- Allow admins to read all registrations
CREATE POLICY "Allow admins to read all registrations" ON barraca_registrations
    FOR SELECT USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superuser'
    );

-- Allow admins to update registrations
CREATE POLICY "Allow admins to update registrations" ON barraca_registrations
    FOR UPDATE USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superuser'
    );

-- Allow admins to delete registrations
CREATE POLICY "Allow admins to delete registrations" ON barraca_registrations
    FOR DELETE USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superuser'
    );
