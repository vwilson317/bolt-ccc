-- Fix RLS policies for barraca_registrations to allow public insertions
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to insert barraca registrations" ON barraca_registrations;
DROP POLICY IF EXISTS "Allow public to read own registrations" ON barraca_registrations;
DROP POLICY IF EXISTS "Allow admins to read all registrations" ON barraca_registrations;
DROP POLICY IF EXISTS "Allow admins to update registrations" ON barraca_registrations;
DROP POLICY IF EXISTS "Allow admins to delete registrations" ON barraca_registrations;

-- Create new policies that work without authentication
-- Allow public to insert registrations (no auth required)
CREATE POLICY "Allow public to insert barraca registrations" ON barraca_registrations
    FOR INSERT WITH CHECK (true);

-- Allow public to read registrations (no auth required for now)
CREATE POLICY "Allow public to read registrations" ON barraca_registrations
    FOR SELECT USING (true);

-- Allow admins to update registrations (when authenticated)
CREATE POLICY "Allow admins to update registrations" ON barraca_registrations
    FOR UPDATE USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superuser'
    );

-- Allow admins to delete registrations (when authenticated)
CREATE POLICY "Allow admins to delete registrations" ON barraca_registrations
    FOR DELETE USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'superuser'
    );
