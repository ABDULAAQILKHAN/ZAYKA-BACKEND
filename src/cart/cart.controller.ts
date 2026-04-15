import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto, SyncCartDto } from './dto';
import { CartItem } from './entities/cart-item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getCurrentUser } from '../auth/helpers/get-current-user';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Returns user cart items', type: [CartItem] })
  async getCart(@Request() req: any): Promise<CartItem[]> {
    const user = getCurrentUser(req);
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart', type: CartItem })
  async addItem(@Request() req: any, @Body() addCartItemDto: AddCartItemDto): Promise<CartItem> {
    const user = getCurrentUser(req);
    return this.cartService.addItem(user.id, addCartItemDto);
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update item quantity' })
  @ApiResponse({ status: 200, description: 'Item quantity updated', type: CartItem })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateItemQuantity(
    @Request() req: any,
    @Param('id') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const user = getCurrentUser(req);
    return this.cartService.updateItemQuantity(user.id, cartItemId, updateCartItemDto);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeItem(@Request() req: any, @Param('id') cartItemId: string): Promise<{ success: boolean; id: string }> {
    const user = getCurrentUser(req);
    return this.cartService.removeItem(user.id, cartItemId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@Request() req: any): Promise<{ success: boolean }> {
    const user = getCurrentUser(req);
    await this.cartService.clearCart(user.id);
    return { success: true };
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sync cart from local storage' })
  @ApiResponse({ status: 200, description: 'Cart synced successfully', type: [CartItem] })
  async syncCart(@Request() req: any, @Body() syncCartDto: SyncCartDto): Promise<CartItem[]> {
    const user = getCurrentUser(req);
    return this.cartService.syncCart(user.id, syncCartDto);
  }
}
