-- Add English fluency and tab system fields to barraca_registrations table
-- Migration: 20250105000000_add_english_fluency_and_tab_system.sql

-- Add english_fluency column
ALTER TABLE barraca_registrations 
ADD COLUMN english_fluency text CHECK (english_fluency IN ('no', 'not_fluent', 'fluent')) DEFAULT 'no';

-- Add english_speaker_names column
ALTER TABLE barraca_registrations 
ADD COLUMN english_speaker_names text;

-- Add tab_system column
ALTER TABLE barraca_registrations 
ADD COLUMN tab_system text CHECK (tab_system IN ('name_only', 'individual_paper', 'number_on_chair', 'digital')) DEFAULT 'name_only';

-- Add comments for documentation
COMMENT ON COLUMN barraca_registrations.english_fluency IS 'English fluency level of staff: no, not_fluent, or fluent';
COMMENT ON COLUMN barraca_registrations.english_speaker_names IS 'Names of English-speaking staff members (only when fluency is fluent)';
COMMENT ON COLUMN barraca_registrations.tab_system IS 'System used to track customer orders: name_only, individual_paper, number_on_chair, or digital';