import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ example: 'uuid-string', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'order-uuid', description: 'Order ID' })
  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiProperty({ example: 'menu_item_123', description: 'Original menu item ID' })
  @Column({ name: 'menu_item_id' })
  menuItemId: string;

  @ApiProperty({ example: 'Butter Chicken', description: 'Item name at time of order' })
  @Column()
  name: string;

  @ApiProperty({ example: 2, description: 'Quantity ordered' })
  @Column()
  quantity: number;

  @ApiProperty({ example: 350, description: 'Price per item at time of order' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: 'Full', description: 'Size of the item' })
  @Column({ nullable: true })
  size: string;

  @ApiProperty({ example: '/images/butter-chicken.jpg', description: 'Item image URL' })
  @Column({ nullable: true })
  image: string;
}
