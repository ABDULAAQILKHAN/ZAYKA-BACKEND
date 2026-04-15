import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto, UpdateCartItemDto, SyncCartDto, CartItemSize } from './dto';
import { MenuItemsService } from '../menu-items/menu-items.service';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { toSnakeCase, toCamelCase } from '../common/utils/case-mapper';

@Injectable()
export class CartService {
  constructor(
    private readonly configService: ConfigService,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async getCart(userId: string): Promise<CartItem[]> {
    const { data, error } = await this.client
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    handleSupabaseError(error, 'Failed to fetch cart');
    return (data ?? []).map(row => toCamelCase(row));
  }

  async addItem(userId: string, addCartItemDto: AddCartItemDto): Promise<CartItem> {
    const { menuItemId, quantity, size } = addCartItemDto;

    const menuItem = await this.menuItemsService.findOne(menuItemId);
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }

    const cartItemId = `${menuItemId}-${size}`;
    const price = size === CartItemSize.Half && menuItem.halfPrice ? Number(menuItem.halfPrice) : Number(menuItem.fullPrice);
    const name = `${menuItem.name} (${size})`;

    const { data: existing, error: existingError } = await this.client
      .from('cart_items')
      .select('*')
      .eq('cart_item_id', cartItemId)
      .eq('user_id', userId)
      .maybeSingle();

    handleSupabaseError(existingError, 'Failed to read cart item');

    if (existing) {
      const { data, error } = await this.client
        .from('cart_items')
        .update({ quantity: Number(existing.quantity ?? 0) + quantity })
        .eq('cart_item_id', cartItemId)
        .eq('user_id', userId)
        .select('*')
        .single();

      handleSupabaseError(error, 'Failed to update cart item quantity');
      return toCamelCase(data);
    }

    const payload = toSnakeCase({
      cartItemId,
      userId,
      id: menuItemId,
      name,
      price,
      image: menuItem.image,
      quantity,
      size,
    });

    const { data, error } = await this.client
      .from('cart_items')
      .insert(payload)
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to create cart item');
    return toCamelCase(data);
  }

  async updateItemQuantity(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<CartItem> {
    const { data, error } = await this.client
      .from('cart_items')
      .update({ quantity: updateCartItemDto.quantity })
      .eq('cart_item_id', cartItemId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    return toCamelCase(data);
  }

  async removeItem(userId: string, cartItemId: string): Promise<{ success: boolean; id: string }> {
    const { error } = await this.client
      .from('cart_items')
      .delete()
      .eq('cart_item_id', cartItemId)
      .eq('user_id', userId);

    handleSupabaseError(error, 'Failed to remove cart item');
    return { success: true, id: cartItemId };
  }

  async syncCart(userId: string, syncCartDto: SyncCartDto): Promise<CartItem[]> {
    // 1. Clear current cart
    await this.clearCart(userId);

    // 2. Insert new items
    if (syncCartDto.items && syncCartDto.items.length > 0) {
      const payload = syncCartDto.items.map(item => toSnakeCase({ ...item, userId }));
      const { error } = await this.client.from('cart_items').insert(payload);
      handleSupabaseError(error, 'Failed to sync cart items');
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const { error } = await this.client.from('cart_items').delete().eq('user_id', userId);
    handleSupabaseError(error, 'Failed to clear cart');
  }
}
