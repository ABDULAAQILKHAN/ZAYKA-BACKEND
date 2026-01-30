import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'addr_123abc', description: 'Address ID for delivery' })
  @IsString()
  addressId: string;

  @ApiProperty({ example: 'Leave at door, ring bell', description: 'Delivery instructions', required: false })
  @IsOptional()
  @IsString()
  deliveryInstructions?: string;
}
