# Menu Management API Documentation

This document describes the REST API endpoints for managing restaurant menu categories and items.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Admin-only endpoints require JWT Bearer token authentication.

### Headers for Admin Routes:
```
Authorization: Bearer <your_jwt_token>
```

---

## Menu Categories Endpoints

### 1. Get All Categories
**GET** `/menu-categories`

Retrieve all menu categories.

**Query Parameters:**
- `active` (optional, boolean): Filter by active status
  - Example: `/menu-categories?active=true`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Appetizers",
    "description": "Delicious starters to begin your meal",
    "image": "https://example.com/category.jpg",
    "isActive": true,
    "sortOrder": 1,
    "createdAt": "2024-11-21T10:30:00Z",
    "updatedAt": "2024-11-21T12:45:00Z"
  }
]
```

**Status Codes:**
- `200 OK`: Categories retrieved successfully

---

### 2. Get Category by ID
**GET** `/menu-categories/:id`

Retrieve a specific menu category by its ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Appetizers",
  "description": "Delicious starters to begin your meal",
  "image": "https://example.com/category.jpg",
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2024-11-21T10:30:00Z",
  "updatedAt": "2024-11-21T12:45:00Z"
}
```

**Status Codes:**
- `200 OK`: Category found
- `404 Not Found`: Category not found

---

### 3. Create Category (Admin Only)
**POST** `/menu-categories`

Create a new menu category.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Appetizers",
  "description": "Delicious starters to begin your meal",
  "image": "https://example.com/category.jpg",
  "isActive": true,
  "sortOrder": 1
}
```

**Required Fields:**
- `name` (string, min 2 characters)

**Optional Fields:**
- `description` (string)
- `image` (string, URL)
- `isActive` (boolean, default: true)
- `sortOrder` (number, default: 0)

**Response:**
```json
{
  "id": "uuid",
  "name": "Appetizers",
  "description": "Delicious starters to begin your meal",
  "image": "https://example.com/category.jpg",
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2024-11-21T10:30:00Z",
  "updatedAt": "2024-11-21T10:30:00Z"
}
```

**Status Codes:**
- `201 Created`: Category created successfully
- `409 Conflict`: Category with this name already exists
- `403 Forbidden`: Not authorized (requires admin role)

---

### 4. Update Category (Admin Only)
**PUT** `/menu-categories/:id`

Update an existing menu category.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Appetizers",
  "description": "New description",
  "image": "https://example.com/new-image.jpg",
  "isActive": false,
  "sortOrder": 2
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Updated Appetizers",
  "description": "New description",
  "image": "https://example.com/new-image.jpg",
  "isActive": false,
  "sortOrder": 2,
  "createdAt": "2024-11-21T10:30:00Z",
  "updatedAt": "2024-11-21T14:30:00Z"
}
```

**Status Codes:**
- `200 OK`: Category updated successfully
- `404 Not Found`: Category not found
- `409 Conflict`: Category with this name already exists
- `403 Forbidden`: Not authorized (requires admin role)

---

### 5. Delete Category (Admin Only)
**DELETE** `/menu-categories/:id`

Delete a menu category.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Category \"Appetizers\" deleted successfully"
}
```

**Status Codes:**
- `200 OK`: Category deleted successfully
- `404 Not Found`: Category not found
- `403 Forbidden`: Not authorized (requires admin role)

---

## Menu Items Endpoints

### 1. Get All Menu Items
**GET** `/menu-items`

Retrieve all menu items with optional filters.

**Query Parameters:**
- `category` (optional, string): Filter by category name
- `available` (optional, boolean): Filter by availability status
- `search` (optional, string): Search in name and description

**Examples:**
- Get all items: `/menu-items`
- Get available items: `/menu-items?available=true`
- Get items by category: `/menu-items?category=Main Course`
- Combined filters: `/menu-items?category=Main Course&available=true`
- Search items: `/menu-items?search=chicken`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Butter Chicken",
    "description": "Tender chicken in rich, creamy tomato sauce",
    "price": 15.99,
    "image": "https://example.com/butter-chicken.jpg",
    "category": "Main Course",
    "isVeg": false,
    "isSpicy": true,
    "isAvailable": true,
    "ingredients": ["chicken", "tomato", "cream", "butter", "spices"],
    "allergens": ["dairy", "nuts"],
    "nutritionalInfo": {
      "calories": 450,
      "protein": 35,
      "carbs": 20,
      "fat": 25
    },
    "preparationTime": 25,
    "createdAt": "2024-11-21T10:30:00Z",
    "updatedAt": "2024-11-21T12:45:00Z"
  }
]
```

**Status Codes:**
- `200 OK`: Items retrieved successfully

---

### 2. Get Menu Item by ID
**GET** `/menu-items/:id`

Retrieve a specific menu item by its ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Butter Chicken",
  "description": "Tender chicken in rich, creamy tomato sauce",
  "price": 15.99,
  "image": "https://example.com/butter-chicken.jpg",
  "category": "Main Course",
  "isVeg": false,
  "isSpicy": true,
  "isAvailable": true,
  "ingredients": ["chicken", "tomato", "cream", "butter", "spices"],
  "allergens": ["dairy", "nuts"],
  "nutritionalInfo": {
    "calories": 450,
    "protein": 35,
    "carbs": 20,
    "fat": 25
  },
  "preparationTime": 25,
  "createdAt": "2024-11-21T10:30:00Z",
  "updatedAt": "2024-11-21T12:45:00Z"
}
```

**Status Codes:**
- `200 OK`: Item found
- `404 Not Found`: Item not found

---

### 3. Create Menu Item (Admin Only)
**POST** `/menu-items`

Create a new menu item.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Butter Chicken",
  "description": "Tender chicken in rich, creamy tomato sauce",
  "price": 15.99,
  "image": "https://example.com/butter-chicken.jpg",
  "category": "Main Course",
  "isVeg": false,
  "isSpicy": true,
  "isAvailable": true,
  "ingredients": ["chicken", "tomato", "cream", "butter", "spices"],
  "allergens": ["dairy", "nuts"],
  "nutritionalInfo": {
    "calories": 450,
    "protein": 35,
    "carbs": 20,
    "fat": 25
  },
  "preparationTime": 25
}
```

**Required Fields:**
- `name` (string, min 2 characters)
- `description` (string, min 10 characters)
- `price` (number, >= 0)
- `category` (string)

**Optional Fields:**
- `image` (string, URL)
- `isVeg` (boolean, default: false)
- `isSpicy` (boolean, default: false)
- `isAvailable` (boolean, default: true)
- `ingredients` (array of strings)
- `allergens` (array of strings)
- `nutritionalInfo` (object with calories, protein, carbs, fat)
- `preparationTime` (number, minutes)

**Response:**
```json
{
  "id": "uuid",
  "name": "Butter Chicken",
  "description": "Tender chicken in rich, creamy tomato sauce",
  "price": 15.99,
  "image": "https://example.com/butter-chicken.jpg",
  "category": "Main Course",
  "isVeg": false,
  "isSpicy": true,
  "isAvailable": true,
  "ingredients": ["chicken", "tomato", "cream", "butter", "spices"],
  "allergens": ["dairy", "nuts"],
  "nutritionalInfo": {
    "calories": 450,
    "protein": 35,
    "carbs": 20,
    "fat": 25
  },
  "preparationTime": 25,
  "createdAt": "2024-11-21T10:30:00Z",
  "updatedAt": "2024-11-21T10:30:00Z"
}
```

**Status Codes:**
- `201 Created`: Item created successfully
- `403 Forbidden`: Not authorized (requires admin role)

---

### 4. Update Menu Item (Admin Only)
**PUT** `/menu-items/:id`

Update an existing menu item.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Butter Chicken",
  "description": "New description",
  "price": 17.99,
  "isAvailable": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Updated Butter Chicken",
  "description": "New description",
  "price": 17.99,
  "image": "https://example.com/butter-chicken.jpg",
  "category": "Main Course",
  "isVeg": false,
  "isSpicy": true,
  "isAvailable": false,
  "ingredients": ["chicken", "tomato", "cream", "butter", "spices"],
  "allergens": ["dairy", "nuts"],
  "nutritionalInfo": {
    "calories": 450,
    "protein": 35,
    "carbs": 20,
    "fat": 25
  },
  "preparationTime": 25,
  "createdAt": "2024-11-21T10:30:00Z",
  "updatedAt": "2024-11-21T14:30:00Z"
}
```

**Status Codes:**
- `200 OK`: Item updated successfully
- `404 Not Found`: Item not found
- `403 Forbidden`: Not authorized (requires admin role)

---

### 5. Toggle Item Availability (Admin Only)
**PATCH** `/menu-items/:id/availability`

Toggle the availability status of a menu item.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Butter Chicken",
  "isAvailable": false,
  ...
}
```

**Status Codes:**
- `200 OK`: Availability toggled successfully
- `404 Not Found`: Item not found
- `403 Forbidden`: Not authorized (requires admin role)

---

### 6. Delete Menu Item (Admin Only)
**DELETE** `/menu-items/:id`

Delete a menu item.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Menu item \"Butter Chicken\" deleted successfully"
}
```

**Status Codes:**
- `200 OK`: Item deleted successfully
- `404 Not Found`: Item not found
- `403 Forbidden`: Not authorized (requires admin role)

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["name must be at least 2 characters long"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied. Required role: admin, but user has role: user",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Menu item with ID \"uuid\" not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Category with name \"Appetizers\" already exists",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Field Mapping (Database ↔ API)

The API automatically converts between database snake_case and API camelCase:

| Database Field | API Field |
|---------------|-----------|
| is_veg | isVeg |
| is_spicy | isSpicy |
| is_available | isAvailable |
| is_active | isActive |
| sort_order | sortOrder |
| preparation_time | preparationTime |
| nutritional_info | nutritionalInfo |
| created_at | createdAt |
| updated_at | updatedAt |

---

## Database Schema

### menu_categories table
```sql
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  image VARCHAR,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### menu_items table
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR,
  category VARCHAR NOT NULL,
  is_veg BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  ingredients JSONB,
  allergens JSONB,
  nutritional_info JSONB,
  preparation_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Example Usage with cURL

### Get All Active Categories
```bash
curl -X GET "http://localhost:3000/menu-categories?active=true"
```

### Create a Category (Admin)
```bash
curl -X POST "http://localhost:3000/menu-categories" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Appetizers",
    "description": "Delicious starters",
    "isActive": true,
    "sortOrder": 1
  }'
```

### Get Available Items in a Category
```bash
curl -X GET "http://localhost:3000/menu-items?category=Main%20Course&available=true"
```

### Create a Menu Item (Admin)
```bash
curl -X POST "http://localhost:3000/menu-items" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Butter Chicken",
    "description": "Tender chicken in rich, creamy tomato sauce",
    "price": 15.99,
    "category": "Main Course",
    "isVeg": false,
    "isSpicy": true,
    "isAvailable": true,
    "ingredients": ["chicken", "tomato", "cream"],
    "allergens": ["dairy"],
    "nutritionalInfo": {
      "calories": 450,
      "protein": 35
    },
    "preparationTime": 25
  }'
```

### Search Menu Items
```bash
curl -X GET "http://localhost:3000/menu-items?search=chicken"
```

### Toggle Item Availability (Admin)
```bash
curl -X PATCH "http://localhost:3000/menu-items/ITEM_ID/availability" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Notes

1. **CORS**: Ensure CORS is enabled in your NestJS application for frontend requests
2. **Validation**: All input is validated using class-validator decorators
3. **Authentication**: Admin routes require JWT token with `role: 'admin'` in user_metadata
4. **Database**: Uses PostgreSQL with TypeORM for database operations
5. **JSONB Fields**: ingredients, allergens, and nutritionalInfo are stored as JSONB for flexibility
6. **Sorting**: Categories are sorted by sort_order then name; items are sorted by name
7. **Timestamps**: created_at and updated_at are automatically managed by TypeORM
