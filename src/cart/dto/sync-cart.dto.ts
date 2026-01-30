import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddCartItemDto } from './add-cart-item.dto';

export class SyncCartDto {
  @ApiProperty({ type: [AddCartItemDto], description: 'Array of cart items to sync (menuItemId, quantity, size)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCartItemDto)
  items: AddCartItemDto[];
}
