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

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Returns user cart items', type: [CartItem] })
  async getCart(@Request() req): Promise<CartItem[]> {
    return this.cartService.getCart(req.user.user_metadata.sub);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart', type: CartItem })
  async addItem(
    @Request() req,
    @Body() addCartItemDto: AddCartItemDto,
  ): Promise<CartItem> {
    return this.cartService.addItem(req.user.user_metadata.sub, addCartItemDto);
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update item quantity' })
  @ApiResponse({ status: 200, description: 'Item quantity updated', type: CartItem })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateItemQuantity(
    @Request() req,
    @Param('id') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    return this.cartService.updateItemQuantity(req.user.user_metadata.sub, cartItemId, updateCartItemDto);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeItem(
    @Request() req,
    @Param('id') cartItemId: string,
  ): Promise<{ success: boolean; id: string }> {
    return this.cartService.removeItem(req.user.user_metadata.sub, cartItemId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@Request() req): Promise<{ success: boolean }> {
    return this.cartService.clearCart(req.user.user_metadata.sub);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sync cart from local storage' })
  @ApiResponse({ status: 200, description: 'Cart synced successfully', type: [CartItem] })
  async syncCart(
    @Request() req,
    @Body() syncCartDto: SyncCartDto,
  ): Promise<CartItem[]> {
    return this.cartService.syncCart(req.user.user_metadata.sub, syncCartDto);
  }
}
