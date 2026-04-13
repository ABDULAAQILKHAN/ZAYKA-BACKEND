import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto, UpdateCartItemDto, SyncCartDto, CartItemSize } from './dto';
import { MenuItemsService } from '../menu-items/menu-items.service';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError, mapCartItemRow } from '../lib/supabase-mappers';

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
    return (data ?? []).map(mapCartItemRow) as CartItem[];
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
      return mapCartItemRow(data) as CartItem;
    }

    const { data, error } = await this.client
      .from('cart_items')
      .insert({
        cart_item_id: cartItemId,
        user_id: userId,
        id: menuItemId,
        name,
        price,
        image: menuItem.image,
        quantity,
        size,
      })
      .select('*')
      .single();

    handleSupabaseError(error, 'Failed to create cart item');
    return mapCartItemRow(data) as CartItem;
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

    return mapCartItemRow(data) as CartItem;
  }

  async removeItem(userId: string, cartItemId: string): Promise<{ success: boolean; id: string }> {
    const { data, error } = await this.client
      .from('cart_items')
      .delete()
      .eq('cart_item_id', cartItemId)
      .eq('user_id', userId)
      .select('cart_item_id');

    if (error) {
      handleSupabaseError(error, 'Failed to remove cart item');
    }

    if (!data || data.length === 0) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    return { success: true, id: cartItemId };
  }

  async clearCart(userId: string): Promise<{ success: boolean }> {
    const { error } = await this.client.from('cart_items').delete().eq('user_id', userId);
    handleSupabaseError(error, 'Failed to clear cart');
    return { success: true };
  }

  async syncCart(userId: string, syncCartDto: SyncCartDto): Promise<CartItem[]> {
    const { items } = syncCartDto;

    for (const item of items) {
      await this.addItem(userId, item);
    }

    return this.getCart(userId);
  }
}
