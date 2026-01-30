import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto, UpdateCartItemDto, SyncCartDto, CartItemSize } from './dto';
import { MenuItemsService } from '../menu-items/menu-items.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  /**
   * Get all cart items for a user
   */
  async getCart(userId: string): Promise<CartItem[]> {
    return this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Add an item to cart or update if it already exists
   */
  async addItem(userId: string, addCartItemDto: AddCartItemDto): Promise<CartItem> {
    const { menuItemId, quantity, size } = addCartItemDto;

    // Lookup the menu item
    const menuItem = await this.menuItemsService.findOne(menuItemId);
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }

    // Generate cartItemId
    const cartItemId = `${menuItemId}-${size}`;

    // Determine price based on size
    const price = size === CartItemSize.Half && menuItem.halfPrice 
      ? Number(menuItem.halfPrice) 
      : Number(menuItem.fullPrice);

    // Generate name with size suffix
    const name = `${menuItem.name} (${size})`;

    const existingItem = await this.cartRepository.findOne({
      where: { cartItemId, userId },
    });

    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += quantity;
      return this.cartRepository.save(existingItem);
    }

    // Create new cart item
    const cartItem = this.cartRepository.create({
      cartItemId,
      userId,
      id: menuItemId,
      name,
      price,
      image: menuItem.image,
      quantity,
      size,
    });
    return this.cartRepository.save(cartItem);
  }

  /**
   * Update quantity of a cart item
   */
  async updateItemQuantity(
    userId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const cartItem = await this.cartRepository.findOne({
      where: { cartItemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    cartItem.quantity = updateCartItemDto.quantity;
    return this.cartRepository.save(cartItem);
  }

  /**
   * Remove an item from cart
   */
  async removeItem(userId: string, cartItemId: string): Promise<{ success: boolean; id: string }> {
    const result = await this.cartRepository.delete({ cartItemId, userId });
    
    if (result.affected === 0) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    return { success: true, id: cartItemId };
  }

  /**
   * Clear all items from user's cart
   */
  async clearCart(userId: string): Promise<{ success: boolean }> {
    await this.cartRepository.delete({ userId });
    return { success: true };
  }

  /**
   * Sync cart items from local storage (merge with server cart)
   */
  async syncCart(userId: string, syncCartDto: SyncCartDto): Promise<CartItem[]> {
    const { items } = syncCartDto;

    for (const item of items) {
      // Use addItem to properly handle menu item lookup
      await this.addItem(userId, item);
    }

    // Return updated cart
    return this.getCart(userId);
  }
}
