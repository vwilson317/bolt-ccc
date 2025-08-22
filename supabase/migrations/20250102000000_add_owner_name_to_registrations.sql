-- Add owner_name field and make nearest_posto required
ALTER TABLE barraca_registrations 
ADD COLUMN owner_name TEXT NOT NULL DEFAULT 'Unknown Owner';

-- Remove the default after adding the column
ALTER TABLE barraca_registrations 
ALTER COLUMN owner_name DROP DEFAULT;

-- Make nearest_posto required
ALTER TABLE barraca_registrations 
ALTER COLUMN nearest_posto SET NOT NULL;

-- Update existing records to have a default nearest_posto if they don't have one
UPDATE barraca_registrations 
SET nearest_posto = 'Posto 1' 
WHERE nearest_posto IS NULL OR nearest_posto = '';

-- Update existing records to have a default owner_name if they don't have one
UPDATE barraca_registrations 
SET owner_name = 'Unknown Owner' 
WHERE owner_name IS NULL OR owner_name = '';
