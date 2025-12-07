import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, Min, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class NutritionalInfoDto {
  @ApiProperty({ example: 450, description: 'Calories', required: false })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiProperty({ example: 35, description: 'Protein in grams', required: false })
  @IsOptional()
  @IsNumber()
  protein?: number;

  @ApiProperty({ example: 20, description: 'Carbohydrates in grams', required: false })
  @IsOptional()
  @IsNumber()
  carbs?: number;

  @ApiProperty({ example: 25, description: 'Fat in grams', required: false })
  @IsOptional()
  @IsNumber()
  fat?: number;
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Butter Chicken', description: 'Item name' })
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: 'Tender chicken in rich, creamy tomato sauce', description: 'Item description' })
  @IsString()
  @MinLength(10, { message: 'description must be at least 10 characters long' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiProperty({ example: 15.99, description: 'Full plate price' })
  @IsNumber()
  @Min(0, { message: 'fullPrice must be a positive number' })
  fullPrice: number;

  @ApiProperty({ example: 9.99, description: 'Half plate price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'halfPrice must be a positive number' })
  halfPrice?: number;

  @ApiProperty({ example: 'https://example.com/butter-chicken.jpg', description: 'Item image URL', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  image?: string;

  @ApiProperty({ example: 'uuid-string', description: 'Category ID', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  categoryId?: string;

  @ApiProperty({ example: false, description: 'Whether the item is vegetarian', required: false })
  @IsOptional()
  @IsBoolean()
  isVeg?: boolean;

  @ApiProperty({ example: true, description: 'Whether the item is spicy', required: false })
  @IsOptional()
  @IsBoolean()
  isSpicy?: boolean;

  @ApiProperty({ example: true, description: 'Whether the item is currently available', required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ 
    example: ['chicken', 'tomato', 'cream', 'butter', 'spices'], 
    description: 'List of ingredients',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiProperty({ 
    example: ['dairy', 'nuts'], 
    description: 'List of allergens',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiProperty({ 
    example: { calories: 450, protein: 35, carbs: 20, fat: 25 }, 
    description: 'Nutritional information',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionalInfoDto)
  nutritionalInfo?: NutritionalInfoDto;

  @ApiProperty({ example: 25, description: 'Preparation time in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'preparationTime must be a positive number' })
  preparationTime?: number;
}
