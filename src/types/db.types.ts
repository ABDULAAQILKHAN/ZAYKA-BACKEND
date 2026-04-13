export interface Profile {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  phone: string;
  avatar: string | null;
  defaultAddress: string | null;
  isDark: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  fullPrice: number;
  halfPrice: number | null;
  image: string | null;
  categoryId: string | null;
  category: string | null;
  isVeg: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  ingredients: string[] | null;
  allergens: string[] | null;
  nutritionalInfo: Record<string, unknown> | null;
  preparationTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  size: string | null;
  image: string | null;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  status: string;
  deliveryAddress: string;
  deliveryInstructions: string | null;
  customerName: string;
  customerPhone: string;
  estimatedCompletionTime: string | null;
  createdAt: string;
  updatedAt: string;
}
