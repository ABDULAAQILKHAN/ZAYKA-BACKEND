import { IsString, IsNotEmpty, IsNumber, IsUrl, IsBoolean, IsOptional, MaxLength, Min, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTodaysSpecialDto {
  @ApiProperty({ description: 'Name of the today\'s special', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Description of the today\'s special' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Price of the special', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Image URL for the special', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
//   @Matches(/^https?:\/\/.+/, { message: 'Image must be a valid HTTP/HTTPS URL' })
  @MaxLength(500)
  image: string;

  @ApiProperty({ description: 'Category of the special', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiPropertyOptional({ description: 'Whether the item is vegetarian', default: false })
  @IsOptional()
  @IsBoolean()
  isVeg?: boolean;

  @ApiPropertyOptional({ description: 'Whether the special is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
