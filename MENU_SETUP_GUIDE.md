# Menu Management System - Setup Guide

## Overview
A comprehensive REST API for managing restaurant menu categories and items, built with NestJS, TypeORM, and PostgreSQL.

## What's Been Implemented

### ✅ Features Completed

1. **Menu Categories Management**
   - Full CRUD operations
   - Active/inactive filtering
   - Sort order support
   - Admin-only mutations
   - Public read access

2. **Menu Items Management**
   - Full CRUD operations
   - Multi-filter support (category, availability, search)
   - JSONB fields for ingredients, allergens, and nutritional info
   - Toggle availability endpoint
   - Admin-only mutations
   - Public read access

3. **Authentication & Authorization**
   - JWT authentication for admin routes
   - Role-based access control (Admin vs Public)
   - Public GET endpoints for customer menu display

4. **Data Validation**
   - Input validation using class-validator
   - Type safety with TypeScript
   - Proper error responses

5. **Database Integration**
   - TypeORM entities with proper decorators
   - PostgreSQL with JSONB support
   - Auto-generated timestamps
   - Field mapping (snake_case ↔ camelCase)

## Project Structure

```
src/
├── menu-categories/
│   ├── dto/
│   │   ├── create-menu-category.dto.ts
│   │   └── update-menu-category.dto.ts
│   ├── entities/
│   │   └── menu-category.entity.ts
│   ├── menu-categories.controller.spec.ts
│   ├── menu-categories.controller.ts
│   ├── menu-categories.module.ts
│   ├── menu-categories.service.spec.ts
│   └── menu-categories.service.ts
├── menu-items/
│   ├── dto/
│   │   ├── create-menu-item.dto.ts
│   │   └── update-menu-item.dto.ts
│   ├── entities/
│   │   └── menu-item.entity.ts
│   ├── menu-items.controller.spec.ts
│   ├── menu-items.controller.ts
│   ├── menu-items.module.ts
│   ├── menu-items.service.spec.ts
│   └── menu-items.service.ts
└── app.module.ts (updated)
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

All required dependencies are already in your package.json:
- @nestjs/typeorm
- @nestjs/swagger
- typeorm
- pg (PostgreSQL)
- class-validator
- class-transformer

### 2. Environment Variables
Ensure your `.env` file has:
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
```

### 3. Database Migration
The entities will auto-sync to create the tables. Start your application:

```bash
npm run start:dev
```

TypeORM will automatically create these tables:
- `menu_categories`
- `menu_items`

### 4. Verify Setup
Check if the API is running:
```bash
curl http://localhost:3000/menu-categories
```

## API Endpoints Summary

### Menu Categories
- `GET /menu-categories` - Get all categories (public)
- `GET /menu-categories?active=true` - Get active categories (public)
- `GET /menu-categories/:id` - Get category by ID (public)
- `POST /menu-categories` - Create category (admin)
- `PUT /menu-categories/:id` - Update category (admin)
- `DELETE /menu-categories/:id` - Delete category (admin)

### Menu Items
- `GET /menu-items` - Get all items (public)
- `GET /menu-items?category=X&available=true&search=Y` - Filtered items (public)
- `GET /menu-items/:id` - Get item by ID (public)
- `POST /menu-items` - Create item (admin)
- `PUT /menu-items/:id` - Update item (admin)
- `PATCH /menu-items/:id/availability` - Toggle availability (admin)
- `DELETE /menu-items/:id` - Delete item (admin)

## Testing the API

### 1. Using Swagger UI
Access the Swagger documentation at:
```
http://localhost:3000/api
```

### 2. Using cURL

#### Create a Category (Admin)
```bash
curl -X POST http://localhost:3000/menu-categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Appetizers",
    "description": "Delicious starters to begin your meal",
    "isActive": true,
    "sortOrder": 1
  }'
```

#### Get All Categories
```bash
curl http://localhost:3000/menu-categories
```

#### Create a Menu Item (Admin)
```bash
curl -X POST http://localhost:3000/menu-items \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Butter Chicken",
    "description": "Tender chicken in rich, creamy tomato sauce",
    "price": 15.99,
    "category": "Main Course",
    "isVeg": false,
    "isSpicy": true,
    "ingredients": ["chicken", "tomato", "cream", "butter", "spices"],
    "allergens": ["dairy"],
    "nutritionalInfo": {
      "calories": 450,
      "protein": 35,
      "carbs": 20,
      "fat": 25
    },
    "preparationTime": 25
  }'
```

#### Search Menu Items
```bash
curl "http://localhost:3000/menu-items?search=chicken"
```

#### Filter by Category and Availability
```bash
curl "http://localhost:3000/menu-items?category=Main%20Course&available=true"
```

### 3. Using Postman
Import the following collections:
1. Create a new environment with:
   - `BASE_URL`: http://localhost:3000
   - `ADMIN_TOKEN`: Your JWT admin token

2. Test endpoints in this order:
   - GET /menu-categories (should return empty array)
   - POST /menu-categories (create a category)
   - GET /menu-categories (should return the created category)
   - POST /menu-items (create an item)
   - GET /menu-items (should return the created item)

## Testing with Jest

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

## Authentication Setup

### Admin Token Requirements
Your JWT token must have the following structure:
```json
{
  "user_metadata": {
    "role": "admin",
    "sub": "user-id",
    "email": "admin@example.com"
  }
}
```

### Testing Without Authentication
For development, you can temporarily disable auth guards by:
1. Commenting out `@UseGuards(JwtAuthGuard, AdminRoleGuard)` decorators
2. Remember to re-enable before production!

## Database Schema

### menu_categories Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Category name (required) |
| description | TEXT | Category description |
| image | VARCHAR | Image URL |
| is_active | BOOLEAN | Active status (default: true) |
| sort_order | INTEGER | Display order (default: 0) |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### menu_items Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Item name (required) |
| description | TEXT | Item description (required) |
| price | DECIMAL(10,2) | Price (required) |
| image | VARCHAR | Image URL |
| category | VARCHAR | Category name (required) |
| is_veg | BOOLEAN | Vegetarian flag (default: false) |
| is_spicy | BOOLEAN | Spicy flag (default: false) |
| is_available | BOOLEAN | Availability (default: true) |
| ingredients | JSONB | Array of ingredients |
| allergens | JSONB | Array of allergens |
| nutritional_info | JSONB | Nutritional data object |
| preparation_time | INTEGER | Time in minutes |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

## Frontend Integration

### TypeScript Interfaces
```typescript
interface MenuCategory {
  id: string
  name: string
  description?: string
  image?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  isVeg: boolean
  isSpicy: boolean
  isAvailable: boolean
  ingredients?: string[]
  allergens?: string[]
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
  preparationTime?: number
  createdAt: string
  updatedAt: string
}
```

### Example Frontend Usage
```typescript
// Fetch all available items in a category
const response = await fetch(
  'http://localhost:3000/menu-items?category=Main Course&available=true'
);
const items: MenuItem[] = await response.json();

// Create a new item (admin)
const response = await fetch('http://localhost:3000/menu-items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify(newItem)
});
```

## Common Issues & Solutions

### 1. Database Connection Error
**Error:** `Could not connect to database`
**Solution:** Check your `DATABASE_URL` in `.env` file

### 2. Authentication Error
**Error:** `403 Forbidden - Admin access required`
**Solution:** Ensure your JWT token has `user_metadata.role = 'admin'`

### 3. Validation Error
**Error:** `400 Bad Request - name must be at least 2 characters long`
**Solution:** Check request body matches DTO requirements

### 4. JSONB Field Error
**Error:** Issues with ingredients/allergens/nutritionalInfo
**Solution:** Ensure PostgreSQL version >= 9.4 (JSONB support)

## Performance Considerations

1. **Indexing**: Consider adding indexes for frequently queried fields:
   ```sql
   CREATE INDEX idx_menu_items_category ON menu_items(category);
   CREATE INDEX idx_menu_items_available ON menu_items(is_available);
   CREATE INDEX idx_menu_categories_active ON menu_categories(is_active);
   CREATE INDEX idx_menu_categories_sort ON menu_categories(sort_order);
   ```

2. **Caching**: Consider implementing Redis cache for frequently accessed menu data

3. **Pagination**: For large menus, implement pagination in the findAll methods

## Next Steps

### Recommended Enhancements
1. Add image upload functionality (e.g., AWS S3)
2. Implement pagination for menu items
3. Add category-item relationship with foreign keys
4. Implement soft delete instead of hard delete
5. Add audit logging for admin actions
6. Implement rate limiting for public endpoints
7. Add Redis caching for frequently accessed data
8. Implement search with full-text search capabilities

## Support

For detailed API documentation, see: `MENU_API_DOCUMENTATION.md`

## License
Private - Restaurant Management System
