import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderType {
  TABLE = 'table',
  DELIVERY = 'delivery',
  TAKEAWAY = 'takeaway',
}

class OrderItemDto {
  @ApiProperty({ example: 'menu-item-uuid' })
  @IsUUID()
  menuItemId: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'Full', required: false })
  @IsOptional()
  @IsString()
  size?: string;
}

export class CreateOrderDto {
  @ApiProperty({ enum: OrderType, example: OrderType.TABLE })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiProperty({ example: 'table-uuid', required: false })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiProperty({ example: 'addr_123abc', description: 'Address ID for delivery', required: false })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiProperty({ example: 'Leave at door, ring bell', description: 'Delivery instructions', required: false })
  @IsOptional()
  @IsString()
  deliveryInstructions?: string;

  @ApiProperty({ type: [OrderItemDto], description: 'List of items in the order' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}