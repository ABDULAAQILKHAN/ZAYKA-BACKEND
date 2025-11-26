-- Run this query in Neon database to fix the category_id issue
-- This will populate category_id from the existing category column (which currently contains UUIDs)

-- Step 1: Check what's in the category column currently
SELECT id, name, category, category_id FROM menu_items LIMIT 5;

-- Step 2: Update category_id from the category column (if category contains UUID)
UPDATE menu_items 
SET category_id = category::uuid 
WHERE category IS NOT NULL 
  AND category ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 3: Verify the update
SELECT 
  mi.id,
  mi.name as item_name,
  mi.category_id,
  mc.name as category_name
FROM menu_items mi
LEFT JOIN menu_categories mc ON mi.category_id = mc.id;
