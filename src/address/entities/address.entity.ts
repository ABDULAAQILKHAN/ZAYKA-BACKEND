import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('addresses')
@Index('idx_addresses_user', ['userId'])
export class Address {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'user123', description: 'Owner user id' })
  @Column()
  userId: string;

  @ApiProperty({ example: '123 Main St, Apt 4B, Mumbai, Maharashtra, 400001, India' })
  @Column({ type: 'text' })
  value: string;

  @ApiProperty({ example: false })
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
