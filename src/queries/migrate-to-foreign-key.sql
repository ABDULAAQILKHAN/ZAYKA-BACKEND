-- Migration script to add foreign key relationship between menu_items and menu_categories
-- Run this SQL in your PostgreSQL database

-- Step 1: Add new column category_id if it doesn't exist
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category_id UUID;

-- Step 2: Update existing rows - set category_id from the UUID currently in category column
UPDATE menu_items 
SET category_id = category::uuid 
WHERE category IS NOT NULL 
  AND category ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 3: For any rows where category is a name (not UUID), try to match with menu_categories
UPDATE menu_items 
SET category_id = mc.id 
FROM menu_categories mc 
WHERE menu_items.category = mc.name 
  AND menu_items.category_id IS NULL;

-- Step 4: Drop the old category column
ALTER TABLE menu_items DROP COLUMN IF EXISTS category;

-- Step 5: Add foreign key constraint
ALTER TABLE menu_items 
ADD CONSTRAINT fk_menu_items_category 
FOREIGN KEY (category_id) 
REFERENCES menu_categories(id) 
ON DELETE SET NULL;

-- Step 6: Verify the changes
SELECT 
  mi.id,
  mi.name as item_name,
  mi.category_id,
  mc.name as category_name
FROM menu_items mi
LEFT JOIN menu_categories mc ON mi.category_id = mc.id;
