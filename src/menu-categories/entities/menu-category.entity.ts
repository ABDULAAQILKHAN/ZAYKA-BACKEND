import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('menu_categories')
export class MenuCategory {
  @ApiProperty({ example: 'uuid-string', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Appetizers', description: 'Category name' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Delicious starters to begin your meal', description: 'Category description', required: false })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @ApiProperty({ example: 'https://example.com/category.jpg', description: 'Category image URL', required: false })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({ example: true, description: 'Whether the category is active' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ example: 1, description: 'Sort order for displaying categories' })
  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ApiProperty({ example: '2024-11-21T10:30:00Z', description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2024-11-21T12:45:00Z', description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
