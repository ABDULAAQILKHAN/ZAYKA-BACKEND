-- ============================================================
-- FINAL FIX: All remaining TypeORM → Supabase migration gaps
-- Covers: boolean/numeric defaults, updated_at trigger, 
--         NOT NULL relaxation for optional fields
-- ============================================================


-- ==========================================
-- 1. BOOLEAN & NUMERIC COLUMN DEFAULTS
-- ==========================================
-- TypeORM set these at the app level via entity decorators.
-- The Supabase client doesn't, so the DB must provide them.

-- menu_items
ALTER TABLE menu_items ALTER COLUMN is_veg SET DEFAULT false;
ALTER TABLE menu_items ALTER COLUMN is_spicy SET DEFAULT false;
ALTER TABLE menu_items ALTER COLUMN is_available SET DEFAULT true;

-- menu_categories
ALTER TABLE menu_categories ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE menu_categories ALTER COLUMN sort_order SET DEFAULT 0;

-- orders
ALTER TABLE orders ALTER COLUMN tax SET DEFAULT 0;
ALTER TABLE orders ALTER COLUMN delivery_fee SET DEFAULT 0;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';

-- cart_items
ALTER TABLE cart_items ALTER COLUMN quantity SET DEFAULT 1;

-- addresses
ALTER TABLE addresses ALTER COLUMN is_default SET DEFAULT false;

-- special_offers
ALTER TABLE special_offers ALTER COLUMN is_active SET DEFAULT true;

-- todays_specials
ALTER TABLE todays_specials ALTER COLUMN is_veg SET DEFAULT false;
ALTER TABLE todays_specials ALTER COLUMN is_active SET DEFAULT true;


-- ==========================================
-- 2. RELAX NOT NULL WHERE CODE DOESN'T ALWAYS PROVIDE VALUES
-- ==========================================
-- TypeORM entities allowed empty strings for required fields,
-- but Supabase inserts will fail if a value isn't provided.

-- profiles: phone/email might not be available at profile creation
ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN name DROP NOT NULL;

-- special_offers: title can be nullable per entity
ALTER TABLE special_offers ALTER COLUMN title DROP NOT NULL;

-- todays_specials: name can be nullable per entity  
ALTER TABLE todays_specials ALTER COLUMN name DROP NOT NULL;


-- ==========================================
-- 3. AUTO-UPDATE "updated_at" TRIGGER
-- ==========================================
-- TypeORM's @UpdateDateColumn() auto-set updated_at on every update.
-- Without TypeORM, we need a PostgreSQL trigger to replicate this.

-- Create the trigger function (once, reusable by all tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to every table that has updated_at

DROP TRIGGER IF EXISTS set_updated_at ON cart_items;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON addresses;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON orders;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON menu_items;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON menu_categories;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON special_offers;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON special_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON todays_specials;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON todays_specials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 4. RELOAD SCHEMA CACHE
-- ==========================================
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- 5. FINAL VERIFICATION: Show complete schema
-- ==========================================
SELECT 
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name IN (
    'cart_items', 'addresses', 'profiles', 'orders', 'order_items',
    'menu_items', 'menu_categories', 'special_offers', 'todays_specials'
  )
ORDER BY c.table_name, c.ordinal_position;
