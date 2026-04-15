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

  @ApiProperty({ example: 'near window', description: 'Table location description', required: false })
  @Column({ nullable: true })
  location: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}