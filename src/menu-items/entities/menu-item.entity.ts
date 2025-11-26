import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MenuCategory } from '../../menu-categories/entities/menu-category.entity';

@Entity('menu_items')
export class MenuItem {
  @ApiProperty({ example: 'uuid-string', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Butter Chicken', description: 'Item name' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Tender chicken in rich, creamy tomato sauce', description: 'Item description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: 15.99, description: 'Item price' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: 'https://example.com/butter-chicken.jpg', description: 'Item image URL', required: false })
  @Column({ nullable: true })
  image: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => MenuCategory, { eager: true, nullable: true })
  @JoinColumn({ name: 'category_id' })
  categoryRelation: MenuCategory;

  @ApiProperty({ example: false, description: 'Whether the item is vegetarian' })
  @Column({ name: 'is_veg', default: false })
  isVeg: boolean;

  @ApiProperty({ example: true, description: 'Whether the item is spicy' })
  @Column({ name: 'is_spicy', default: false })
  isSpicy: boolean;

  @ApiProperty({ example: true, description: 'Whether the item is currently available' })
  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @ApiProperty({ 
    example: ['chicken', 'tomato', 'cream', 'butter', 'spices'], 
    description: 'List of ingredients',
    required: false,
    type: [String]
  })
  @Column({ type: 'jsonb', nullable: true })
  ingredients: string[];

  @ApiProperty({ 
    example: ['dairy', 'nuts'], 
    description: 'List of allergens',
    required: false,
    type: [String]
  })
  @Column({ type: 'jsonb', nullable: true })
  allergens: string[];

  @ApiProperty({ 
    example: { calories: 450, protein: 35, carbs: 20, fat: 25 }, 
    description: 'Nutritional information',
    required: false
  })
  @Column({ name: 'nutritional_info', type: 'jsonb', nullable: true })
  nutritionalInfo: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };

  @ApiProperty({ example: 25, description: 'Preparation time in minutes', required: false })
  @Column({ name: 'preparation_time', nullable: true })
  preparationTime: number;

  @ApiProperty({ example: '2024-11-21T10:30:00Z', description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2024-11-21T12:45:00Z', description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
