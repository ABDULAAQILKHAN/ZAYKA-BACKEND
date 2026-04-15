import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  OUT_FOR_DELIVERY = 'out-for-delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
@Index('idx_orders_user', ['userId'])
@Index('idx_orders_status', ['status'])
export class Order {
  @ApiProperty({ example: 'uuid-string', description: 'Unique order identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'user123', description: 'User ID who placed the order' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ type: () => [OrderItem], description: 'Order items' })
  @OneToMany(() => OrderItem, (item) => item.order, { eager: true, cascade: true })
  items: OrderItem[];

  @ApiProperty({ example: 756.46, description: 'Total order amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @ApiProperty({ example: 650, description: 'Subtotal before tax and fees' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ApiProperty({ example: 32.5, description: 'Tax amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @ApiProperty({ example: 40, description: 'Delivery fee' })
  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @ApiProperty({ example: 'table', enum: ['table', 'delivery', 'takeaway'] })
  @Column({ name: 'order_type', default: 'delivery' })
  orderType: string;

  @ApiProperty({ example: 'table-uuid', required: false })
  @Column({ name: 'table_id', nullable: true })
  tableId: string;

  @ApiProperty({ example: 'session-uuid', required: false })
  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @ApiProperty({ enum: OrderStatus, example: 'pending', description: 'Order status' })
  @Column({ type: 'varchar', default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: '123 Main St, Mumbai 400001', description: 'Delivery address' })
  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  @ApiProperty({ example: 'Leave at door, ring bell', description: 'Delivery instructions' })
  @Column({ name: 'delivery_instructions', type: 'text', nullable: true })
  deliveryInstructions: string;

  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  @Column({ name: 'customer_name' })
  customerName: string;

  @ApiProperty({ example: '+91 98765 43210', description: 'Customer phone' })
  @Column({ name: 'customer_phone' })
  customerPhone: string;

  @ApiProperty({ example: '2026-01-30T11:15:00Z', description: 'Estimated completion time' })
  @Column({ name: 'estimated_completion_time', type: 'timestamptz', nullable: true })
  estimatedCompletionTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
