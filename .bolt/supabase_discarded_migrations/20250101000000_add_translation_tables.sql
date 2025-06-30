-- Migration: Add Translation Tables
-- Description: Creates tables for managing dynamic content translations
-- Date: 2025-01-01

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Translation keys table
CREATE TABLE translation_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT NOT NULL UNIQUE,
    context TEXT, -- e.g., 'barraca_description', 'product_name'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Translation values table
CREATE TABLE translation_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL, -- 'en', 'pt', 'es'
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(key_id, language_code)
);

-- Content translation mapping table
CREATE TABLE content_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL, -- 'barraca', 'product', 'story'
    content_id TEXT NOT NULL, -- ID of the content being translated
    field_name TEXT NOT NULL, -- 'name', 'description', 'menu_preview'
    translation_key_id UUID NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, field_name)
);

-- Add indexes for performance optimization
CREATE INDEX idx_translation_keys_key_name ON translation_keys(key_name);
CREATE INDEX idx_translation_keys_context ON translation_keys(context);
CREATE INDEX idx_translation_values_key_id ON translation_values(key_id);
CREATE INDEX idx_translation_values_language_code ON translation_values(language_code);
CREATE INDEX idx_translation_values_key_lang ON translation_values(key_id, language_code);
CREATE INDEX idx_content_translations_content_type ON content_translations(content_type);
CREATE INDEX idx_content_translations_content_id ON content_translations(content_id);
CREATE INDEX idx_content_translations_type_id_field ON content_translations(content_type, content_id, field_name);

-- Add RLS (Row Level Security) policies
ALTER TABLE translation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;

-- Policies for translation_keys
CREATE POLICY "Allow public read access to translation keys" ON translation_keys
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert translation keys" ON translation_keys
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update translation keys" ON translation_keys
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete translation keys" ON translation_keys
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for translation_values
CREATE POLICY "Allow public read access to translation values" ON translation_values
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert translation values" ON translation_values
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update translation values" ON translation_values
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete translation values" ON translation_values
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for content_translations
CREATE POLICY "Allow public read access to content translations" ON content_translations
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert content translations" ON content_translations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update content translations" ON content_translations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete content translations" ON content_translations
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_translation_keys_updated_at 
    BEFORE UPDATE ON translation_keys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translation_values_updated_at 
    BEFORE UPDATE ON translation_values 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_translations_updated_at 
    BEFORE UPDATE ON content_translations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial translation keys for testing
INSERT INTO translation_keys (key_name, context) VALUES
    ('barraca_001_name', 'barraca_name'),
    ('barraca_001_description', 'barraca_description'),
    ('barraca_001_menu_preview', 'barraca_menu'),
    ('product_001_name', 'product_name'),
    ('product_001_description', 'product_description');

-- Insert sample translation values
INSERT INTO translation_values (key_id, language_code, value) 
SELECT 
    tk.id,
    'en',
    CASE 
        WHEN tk.key_name = 'barraca_001_name' THEN 'Barraca Uruguay'
        WHEN tk.key_name = 'barraca_001_description' THEN 'Premium beach barraca with luxury amenities'
        WHEN tk.key_name = 'barraca_001_menu_preview' THEN 'Fresh seafood, cocktails, beach snacks'
        WHEN tk.key_name = 'product_001_name' THEN 'Ipanema Sunset Bikini'
        WHEN tk.key_name = 'product_001_description' THEN 'Luxurious Brazilian bikini inspired by Ipanema sunsets'
    END
FROM translation_keys tk
WHERE tk.key_name IN ('barraca_001_name', 'barraca_001_description', 'barraca_001_menu_preview', 'product_001_name', 'product_001_description');

INSERT INTO translation_values (key_id, language_code, value) 
SELECT 
    tk.id,
    'pt',
    CASE 
        WHEN tk.key_name = 'barraca_001_name' THEN 'Barraca Uruguai'
        WHEN tk.key_name = 'barraca_001_description' THEN 'Barraca premium com comodidades de luxo'
        WHEN tk.key_name = 'barraca_001_menu_preview' THEN 'Frutos do mar frescos, coquetéis, petiscos de praia'
        WHEN tk.key_name = 'product_001_name' THEN 'Biquíni Pôr do Sol de Ipanema'
        WHEN tk.key_name = 'product_001_description' THEN 'Biquíni brasileiro luxuoso inspirado nos pores do sol de Ipanema'
    END
FROM translation_keys tk
WHERE tk.key_name IN ('barraca_001_name', 'barraca_001_description', 'barraca_001_menu_preview', 'product_001_name', 'product_001_description');

INSERT INTO translation_values (key_id, language_code, value) 
SELECT 
    tk.id,
    'es',
    CASE 
        WHEN tk.key_name = 'barraca_001_name' THEN 'Barraca Uruguay'
        WHEN tk.key_name = 'barraca_001_description' THEN 'Barraca premium con comodidades de lujo'
        WHEN tk.key_name = 'barraca_001_menu_preview' THEN 'Mariscos frescos, cócteles, aperitivos de playa'
        WHEN tk.key_name = 'product_001_name' THEN 'Bikini Atardecer de Ipanema'
        WHEN tk.key_name = 'product_001_description' THEN 'Bikini brasileño lujoso inspirado en las puestas de sol de Ipanema'
    END
FROM translation_keys tk
WHERE tk.key_name IN ('barraca_001_name', 'barraca_001_description', 'barraca_001_menu_preview', 'product_001_name', 'product_001_description'); 