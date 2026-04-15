# Backend Contract Documentation

This document describes the API payloads and database table structures for the Zayka Backend.

## 1. Global Rules
- **API Layer**: All payloads (Request/Response) use `camelCase`.
- **Database Layer**: All tables and columns use `snake_case`.
- **Mapping**: A clean mapping layer exists in `src/common/utils/case-mapper.ts` to handle conversions between the two layers.

---

## 2. API PAYLOADS (camelCase)

### Tables
- **POST /tables**
  - Request: `{ tableNumber: number, seats?: number, location?: string }`
  - Response: `Table` object
- **GET /tables**
  - Response: `Table[]`
- **PATCH /tables/:id**
  - Request: `{ seats?: number, status?: TableStatus, location?: string }`
  - Response: `Table` object

### Sessions
- **POST /sessions/close/:id**
  - Response: `Session` object
- **GET /sessions**
  - Response: `Session[]`

### Menu
- **POST /menu-categories**
  - Request: `{ name: string, description?: string, image?: string, isActive?: boolean, sortOrder?: number }`
- **POST /menu-items**
  - Request: `{ name: string, description: string, fullPrice: number, halfPrice?: number, categoryId: string, isVeg: boolean, isSpicy: boolean, isAvailable: boolean }`

### Orders
- **POST /orders**
  - Request: `{ orderType: OrderType, tableId?: string, addressId?: string, items: { id: string, quantity: number, size?: string }[] }`
  - Response: `Order` object
- **POST /orders/takeaway**
  - Request: `{ orderType: 'takeaway', items: { id: string, quantity: number, size?: string }[] }`
  - Response: `{ order: Order, invoice: Invoice }`

### Error Format
All errors follow a standard format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## 3. DATABASE TABLES (snake_case)

### tables
- `id` (uuid)
- `table_number` (int, unique)
- `seats` (int)
- `status` (varchar)
- `location` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### sessions
- `id` (uuid)
- `table_id` (uuid)
- `status` (varchar)
- `opened_at` (timestamp)
- `closed_at` (timestamp)

### menu_categories
- `id` (uuid)
- `name` (varchar)
- `description` (text)
- `image` (text)
- `is_active` (boolean)
- `sort_order` (int)

### menu_items
- `id` (uuid)
- `name` (varchar)
- `description` (text)
- `full_price` (numeric)
- `half_price` (numeric)
- `image` (text)
- `category_id` (uuid)
- `is_veg` (boolean)
- `is_spicy` (boolean)
- `is_available` (boolean)
- `ingredients` (text[])
- `allergens` (text[])
- `nutritional_info` (jsonb)
- `preparation_time` (int)

### orders
- `id` (uuid)
- `user_id` (uuid)
- `subtotal` (numeric)
- `tax` (numeric)
- `delivery_fee` (numeric)
- `total` (numeric)
- `status` (varchar)
- `order_type` (varchar)
- `table_id` (uuid)
- `session_id` (uuid)
- `delivery_address` (text)
- `delivery_instructions` (text)
- `customer_name` (varchar)
- `customer_phone` (varchar)
- `estimated_completion_time` (timestamp)

### order_items
- `id` (uuid)
- `order_id` (uuid)
- `menu_item_id` (uuid)
- `name` (varchar)
- `quantity` (int)
- `price` (numeric)
- `size` (varchar)
- `image` (text)

### invoices
- `id` (uuid)
- `reference_id` (uuid)
- `reference_type` (varchar)
- `subtotal` (numeric)
- `tax` (numeric)
- `discount` (numeric)
- `total` (numeric)
- `payment_method` (varchar)
- `status` (varchar)

### profiles
- `id` (uuid)
- `user_id` (uuid)
- `name` (varchar)
- `email` (varchar)
- `phone` (varchar)
- `avatar` (text)
- `default_address` (text)
- `is_dark` (boolean)

### addresses
- `id` (uuid)
- `user_id` (uuid)
- `value` (text)
- `is_default` (boolean)

---

## 4. FIELD MAPPING REFERENCE

| Frontend (camelCase) | Database (snake_case) |
|----------------------|-----------------------|
| tableNumber          | table_number          |
| createdAt            | created_at            |
| updatedAt            | updated_at            |
| isActive             | is_active             |
| sortOrder            | sort_order            |
| fullPrice            | full_price            |
| halfPrice            | half_price            |
| categoryId           | category_id           |
| isVeg                | is_veg                |
| isSpicy              | is_spicy              |
| isAvailable          | is_available          |
| preparationTime      | preparation_time      |
| nutritionalInfo      | nutritional_info      |
| userId               | user_id               |
| deliveryFee          | delivery_fee          |
| orderType            | order_type            |
| tableId              | table_id              |
| sessionId            | session_id            |
| deliveryAddress      | delivery_address      |
| deliveryInstructions | delivery_instructions |
| customerName         | customer_name         |
| customerPhone        | customer_phone        |
| estimatedCompletionTime | estimated_completion_time |
| orderId              | order_id              |
| menuItemId           | menu_item_id          |
| referenceId          | reference_id          |
| referenceType        | reference_type        |
| paymentMethod        | payment_method        |
| defaultAddress       | default_address       |
| isDark               | is_dark               |
| isDefault            | is_default            |
| cartItemId           | cart_item_id          |
