# Migration Guide: Foreign Key Relationship

## What Changed

The menu items now use a proper foreign key relationship with menu categories instead of storing category names as strings.

### Before:
- `category` field stored the category UUID (incorrectly) or name as a string

### After:
- `categoryId` field stores the category UUID with a proper foreign key constraint
- API responses include `category` field with the category name (mapped from the relationship)

## Steps to Apply

### 1. Run the Migration SQL

Execute the migration script in your PostgreSQL database:

```bash
psql -h your-host -U your-user -d your-database -f migrate-to-foreign-key.sql
```

Or run it manually in your database client:
- Open `migrate-to-foreign-key.sql`
- Copy and execute all SQL statements

### 2. Restart Your NestJS Server

```bash
npm run start:dev
```

## API Changes

### Creating a Menu Item

**Before:**
```json
{
  "name": "Butter Chicken",
  "category": "Main Course",  // ❌ Was accepting name or ID
  ...
}
```

**After:**
```json
{
  "name": "Butter Chicken",
  "categoryId": "uuid-of-category",  // ✅ Now requires category ID
  ...
}
```

### Getting Menu Items

**Query parameter change:**
- Before: `?category=Main Course` (by name)
- After: `?categoryId=uuid` (by ID)

**Response format stays the same:**
```json
{
  "id": "...",
  "name": "Butter Chicken",
  "category": "Main Course",  // ✅ Still returns category name
  "categoryId": "uuid",        // ✅ Also includes category ID
  ...
}
```

## Benefits

1. ✅ Data integrity - can't reference non-existent categories
2. ✅ Automatic relationship loading
3. ✅ Proper database constraints
4. ✅ Better performance with indexed foreign keys
5. ✅ Category updates automatically reflected in items

## Testing

After migration, test these endpoints:

1. Get all categories to find category IDs:
   ```bash
   GET /menu-categories
   ```

2. Create a menu item with category ID:
   ```bash
   POST /menu-items
   {
     "categoryId": "uuid-from-step-1",
     ...
   }
   ```

3. Get menu items - verify category name appears correctly:
   ```bash
   GET /menu-items
   ```

4. Filter by category ID:
   ```bash
   GET /menu-items?categoryId=uuid
   ```
