-- Migration: introduce addresses table and rename profile address fields
BEGIN;

-- 1) Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  value TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- 2) Add default_address to profiles (text)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_address TEXT;

-- 3) Optional: backfill from old JSON fields if present (addresses/address)
-- If profiles.address exists and is text-like, you can backfill default_address with it
-- If profiles.addresses exists (jsonb array), set default_address to first element
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'addresses'
  ) THEN
    UPDATE profiles SET default_address = (addresses->>0) WHERE default_address IS NULL AND jsonb_array_length(addresses) > 0;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    -- If 'address' jsonb has a 'value' string, you may adapt this logic
    UPDATE profiles SET default_address = address->>'value' WHERE default_address IS NULL AND address ? 'value';
  END IF;
END$$;

-- 4) (Optional) drop old columns after you confirm data
-- ALTER TABLE profiles DROP COLUMN IF EXISTS addresses;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS address;

COMMIT;
