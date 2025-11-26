-- Fix existing menu items to use category names instead of IDs
-- Run this SQL script in your PostgreSQL database

-- Step 1: Update menu_items to use category names
UPDATE menu_items 
SET category = mc.name 
FROM menu_categories mc 
WHERE menu_items.category = mc.id::text;

-- Step 2: Verify the fix
SELECT id, name, category FROM menu_items;

-- You should now see category names instead of UUIDs
