import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum SessionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('sessions')
export class Session {
  @ApiProperty({ example: 'uuid-string', description: 'Unique session identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid-string', description: 'Table ID associated with this session' })
  @Column({ name: 'table_id' })
  tableId: string;

  @ApiProperty({ enum: SessionStatus, example: 'open', description: 'Session status' })
  @Column({ type: 'varchar', default: SessionStatus.OPEN })
  status: SessionStatus;

  @ApiProperty({ example: '2026-04-15T12:00:00Z', description: 'When the session was opened' })
  @CreateDateColumn({ name: 'opened_at' })
  openedAt: Date;

  @ApiProperty({ example: '2026-04-15T14:00:00Z', description: 'When the session was closed', required: false })
  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}