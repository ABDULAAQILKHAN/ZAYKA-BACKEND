-- Migration: Replace price with full_price and optional half_price in menu_items
-- Safe approach: add new columns, copy data, then drop old column

BEGIN;

-- Add new columns if not exist
ALTER TABLE menu_items 
  ADD COLUMN IF NOT EXISTS full_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS half_price DECIMAL(10,2) NULL;

-- Backfill full_price from existing price
UPDATE menu_items SET full_price = COALESCE(price, 0) WHERE full_price = 0;

-- Drop old price column if exists
ALTER TABLE menu_items DROP COLUMN IF EXISTS price;

COMMIT;
