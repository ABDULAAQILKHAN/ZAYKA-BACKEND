-- ============================================================
-- COMPLETE FIX: Rename camelCase columns → snake_case
-- Run this in Supabase SQL Editor (one single execution)
-- ============================================================

-- ==========================================
-- 1. FIX cart_items TABLE
-- ==========================================
-- Problem: Has BOTH old camelCase (cartItemId, userId) AND new snake_case (cart_item_id, user_id) columns.
-- The old camelCase columns have NOT NULL constraints causing insert failures.

-- Drop the wrong PK (currently on "id" which is just menu_item_id reference)
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;

-- Migrate data from old columns to new columns (if any exists)
UPDATE cart_items SET cart_item_id = "cartItemId" WHERE (cart_item_id IS NULL OR cart_item_id = '') AND "cartItemId" IS NOT NULL;
UPDATE cart_items SET user_id = "userId" WHERE (user_id IS NULL OR user_id = '') AND "userId" IS NOT NULL;

-- Drop old camelCase columns
ALTER TABLE cart_items DROP COLUMN IF EXISTS "cartItemId";
ALTER TABLE cart_items DROP COLUMN IF EXISTS "userId";

-- Fix snake_case column constraints
ALTER TABLE cart_items ALTER COLUMN cart_item_id SET NOT NULL;
ALTER TABLE cart_items ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE cart_items ALTER COLUMN user_id DROP DEFAULT;

-- Add proper PK on cart_item_id + user_id (composite key since same item can be in different users' carts)
ALTER TABLE cart_items ADD PRIMARY KEY (cart_item_id, user_id);


-- ==========================================
-- 2. FIX addresses TABLE
-- ==========================================
-- Problem: Has "userId" instead of "user_id"
-- Code uses: .eq('user_id', userId), .insert({ user_id: ..., is_default: ... })

ALTER TABLE addresses RENAME COLUMN "userId" TO user_id;


-- ==========================================
-- 3. FIX profiles TABLE
-- ==========================================
-- Problem: Has "userId", "isDark", "createdAt", "updatedAt" instead of snake_case
-- Code uses: .eq('user_id', id), .update({ is_dark: ..., default_address: ... })

ALTER TABLE profiles RENAME COLUMN "userId" TO user_id;
ALTER TABLE profiles RENAME COLUMN "isDark" TO is_dark;
ALTER TABLE profiles RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE profiles RENAME COLUMN "updatedAt" TO updated_at;


-- ==========================================
-- 4. FIX special_offers TABLE
-- ==========================================
-- Problem: Has "isActive", "createdAt", "updatedAt" instead of snake_case
-- Code uses: .eq('is_active', active), .insert({ is_active: ... })

ALTER TABLE special_offers RENAME COLUMN "isActive" TO is_active;
ALTER TABLE special_offers RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE special_offers RENAME COLUMN "updatedAt" TO updated_at;


-- ==========================================
-- 5. FIX todays_specials TABLE
-- ==========================================
-- Problem: Has "isVeg", "isActive", "createdAt", "updatedAt" instead of snake_case
-- Code uses: .eq('is_active', active), .insert({ is_veg: ..., is_active: ... })

ALTER TABLE todays_specials RENAME COLUMN "isVeg" TO is_veg;
ALTER TABLE todays_specials RENAME COLUMN "isActive" TO is_active;
ALTER TABLE todays_specials RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE todays_specials RENAME COLUMN "updatedAt" TO updated_at;


-- ==========================================
-- 6. ENSURE ALL FKs ARE CORRECT
-- ==========================================

-- menu_items → menu_categories
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_id_fkey;
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS fk_menu_items_category;
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS fk_menu_items_category_id;

ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES menu_categories(id)
  ON DELETE SET NULL;

-- order_items → orders
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS fk_order_items_order_id;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id)
  ON DELETE CASCADE;


-- ==========================================
-- 7. RELOAD SCHEMA CACHE
-- ==========================================
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- 8. VERIFY EVERYTHING IS CORRECT
-- ==========================================

-- Show all columns for key tables to confirm snake_case
SELECT 'cart_items' AS table_name, column_name, data_type
FROM information_schema.columns WHERE table_name = 'cart_items' AND table_schema = 'public'
UNION ALL
SELECT 'addresses', column_name, data_type
FROM information_schema.columns WHERE table_name = 'addresses' AND table_schema = 'public'
UNION ALL
SELECT 'profiles', column_name, data_type
FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public'
UNION ALL
SELECT 'special_offers', column_name, data_type
FROM information_schema.columns WHERE table_name = 'special_offers' AND table_schema = 'public'
UNION ALL
SELECT 'todays_specials', column_name, data_type
FROM information_schema.columns WHERE table_name = 'todays_specials' AND table_schema = 'public'
ORDER BY table_name, column_name;
