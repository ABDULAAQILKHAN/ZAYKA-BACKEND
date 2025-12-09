import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AddressesDto {
  @ApiProperty({
    example: ['123 Main St', 'Apt 4B', 'Mumbai', 'Maharashtra', '400001', 'India'],
    description: 'Array of address strings',
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsString({ each: true })
  addresses: string[];
}
