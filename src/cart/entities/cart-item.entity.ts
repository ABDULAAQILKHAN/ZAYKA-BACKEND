import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('cart_items')
export class CartItem {
  @ApiProperty({ example: 'menu_item_123-Full', description: 'Unique cart item ID (Item ID + Size)' })
  @PrimaryColumn()
  cartItemId: string;

  @ApiProperty({ example: 'user-uuid', description: 'User ID who owns this cart item' })
  @Column()
  userId: string;

  @ApiProperty({ example: 'menu_item_123', description: 'Menu item ID' })
  @Column()
  id: string;

  @ApiProperty({ example: 'Chicken Biryani', description: 'Item name' })
  @Column()
  name: string;

  @ApiProperty({ example: 250, description: 'Item price' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: '/images/biryani.jpg', description: 'Item image URL', required: false })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({ example: 1, description: 'Quantity of the item' })
  @Column({ default: 1 })
  quantity: number;

  @ApiProperty({ example: 'Full', description: 'Size of the item (Full/Half)', required: false })
  @Column({ nullable: true })
  size: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
