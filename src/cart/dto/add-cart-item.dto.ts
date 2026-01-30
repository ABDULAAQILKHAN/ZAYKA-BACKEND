import { IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CartItemSize {
  Full = 'Full',
  Half = 'Half',
}

export class AddCartItemDto {
  @ApiProperty({ example: 'menu_item_123', description: 'Menu item ID from menu table' })
  @IsString()
  menuItemId: string;

  @ApiProperty({ example: 1, description: 'Quantity of the item' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'Full', description: 'Size of the item (Full/Half)', enum: CartItemSize })
  @IsEnum(CartItemSize)
  size: CartItemSize;
}

