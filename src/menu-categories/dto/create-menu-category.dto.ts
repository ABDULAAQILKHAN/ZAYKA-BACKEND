import { IsString, IsOptional, IsBoolean, IsNumber, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuCategoryDto {
  @ApiProperty({ example: 'Appetizers', description: 'Category name' })
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: 'Delicious starters to begin your meal', description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ example: 'https://example.com/category.jpg', description: 'Category image URL', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  image?: string;

  @ApiProperty({ example: true, description: 'Whether the category is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 1, description: 'Sort order for displaying categories', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
