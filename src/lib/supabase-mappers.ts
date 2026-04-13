import { BadRequestException } from '@nestjs/common';

export function handleSupabaseError(error: { message?: string } | null, context: string): never | void {
  if (error) {
    throw new BadRequestException(`${context}: ${error.message ?? 'Unknown Supabase error'}`);
  }
}

export function mapProfileRow(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar,
    defaultAddress: row.default_address ?? row.defaultAddress ?? null,
    isDark: row.is_dark ?? row.isDark ?? false,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

export function mapAddressRow(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    value: row.value,
    isDefault: row.is_default ?? row.isDefault ?? false,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

export function mapMenuCategoryRow(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    isActive: row.is_active ?? row.isActive ?? true,
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

export function mapMenuItemRow(row: any) {
  if (!row) return row;

  const categoryRelation = row.menu_categories
    ? {
        id: row.menu_categories.id,
        name: row.menu_categories.name,
      }
    : undefined;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    fullPrice: Number(row.full_price ?? row.fullPrice ?? 0),
    halfPrice: row.half_price !== null && row.half_price !== undefined ? Number(row.half_price) : null,
    image: row.image,
    categoryId: row.category_id ?? row.categoryId ?? null,
    category: row.menu_categories?.name ?? null,
    categoryRelation,
    isVeg: row.is_veg ?? row.isVeg ?? false,
    isSpicy: row.is_spicy ?? row.isSpicy ?? false,
    isAvailable: row.is_available ?? row.isAvailable ?? true,
    ingredients: row.ingredients ?? null,
    allergens: row.allergens ?? null,
    nutritionalInfo: row.nutritional_info ?? row.nutritionalInfo ?? null,
    preparationTime: row.preparation_time ?? row.preparationTime ?? null,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

export function mapCartItemRow(row: any) {
  if (!row) return row;
  return {
    cartItemId: row.cart_item_id ?? row.cartItemId,
    userId: row.user_id ?? row.userId,
    id: row.id,
    name: row.name,
    price: Number(row.price ?? 0),
    image: row.image,
    quantity: Number(row.quantity ?? 0),
    size: row.size,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

export function mapOrderItemRow(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    orderId: row.order_id ?? row.orderId,
    menuItemId: row.menu_item_id ?? row.menuItemId,
    name: row.name,
    quantity: Number(row.quantity ?? 0),
    price: Number(row.price ?? 0),
    size: row.size,
    image: row.image,
  };
}

export function mapOrderRow(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    items: Array.isArray(row.order_items) ? row.order_items.map(mapOrderItemRow) : [],
    total: Number(row.total ?? 0),
    subtotal: Number(row.subtotal ?? 0),
    tax: Number(row.tax ?? 0),
    deliveryFee: Number(row.delivery_fee ?? row.deliveryFee ?? 0),
    status: row.status,
    deliveryAddress: row.delivery_address ?? row.deliveryAddress,
    deliveryInstructions: row.delivery_instructions ?? row.deliveryInstructions ?? null,
    customerName: row.customer_name ?? row.customerName,
    customerPhone: row.customer_phone ?? row.customerPhone,
    estimatedCompletionTime: row.estimated_completion_time ?? row.estimatedCompletionTime ?? null,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

export function mapSpecialOfferRow(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    link: row.link,
    isActive: row.is_active ?? row.isActive ?? true,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

export function mapTodaysSpecialRow(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price ?? 0),
    image: row.image,
    category: row.category,
    isVeg: row.is_veg ?? row.isVeg ?? false,
    isActive: row.is_active ?? row.isActive ?? true,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}
