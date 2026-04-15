import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
}

@Entity('tables')
export class Table {
  @ApiProperty({ example: 'uuid-string', description: 'Unique table identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 1, description: 'Table number (must be unique)' })
  @Column({ name: 'table_number', unique: true })
  tableNumber: number;

  @ApiProperty({ example: 4, description: 'Number of seats at the table' })
  @Column({ default: 4 })
  seats: number;

  @ApiProperty({ enum: TableStatus, example: 'available', description: 'Current table status' })
  @Column({ type: 'varchar', default: TableStatus.AVAILABLE })
  status: TableStatus;

  @ApiProperty({ example: true, description: 'Whether the table is near a window', required: false })
  @Column({ name: 'table_near_window', type: 'boolean', default: false })
  tableNearWindow: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}