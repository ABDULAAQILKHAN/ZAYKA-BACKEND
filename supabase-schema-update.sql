-- Add table_near_window boolean column with default false
ALTER TABLE tables ADD COLUMN IF NOT EXISTS table_near_window BOOLEAN DEFAULT false;

-- Migrate any existing 'near window' data if you had any previously
UPDATE tables SET table_near_window = true WHERE location = 'near window';

-- Drop the old location column as it's no longer needed
-- ALTER TABLE tables DROP COLUMN location;
