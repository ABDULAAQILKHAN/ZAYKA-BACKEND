import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('invoices')
export class Invoice {
  @ApiProperty({ example: 'uuid-string', description: 'Unique invoice identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-string', description: 'Order ID or Session ID', required: false })
  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @ApiProperty({ example: 'order', description: 'Type of reference (order or session)' })
  @Column({ name: 'reference_type' })
  referenceType: 'order' | 'session';

  @ApiProperty({ example: 756.46, description: 'Subtotal amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ApiProperty({ example: 37.82, description: 'Tax amount (GST)' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tax: number;

  @ApiProperty({ example: 0, description: 'Discount amount', default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @ApiProperty({ example: 794.28, description: 'Total amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @ApiProperty({ example: 'paid', description: 'Invoice status' })
  @Column({ default: 'paid' })
  status: string;

  @ApiProperty({ example: 'cash', description: 'Payment method' })
  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}