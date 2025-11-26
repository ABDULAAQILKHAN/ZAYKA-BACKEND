-- Menu Management System - Database Reset Script
-- Run this script in your PostgreSQL database to clean up existing tables
-- WARNING: This will delete all data in menu_categories and menu_items tables

-- Drop existing tables if they exist
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;

-- The tables will be automatically recreated by TypeORM when you start the server
-- with the correct schema based on your entities

-- After running this script:
-- 1. Restart your NestJS server: npm run start:dev
-- 2. The tables will be created with the correct schema
-- 3. You can then start adding menu data
