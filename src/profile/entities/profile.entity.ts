import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('profiles')
export class Profile {
  @ApiProperty({ example: 'uuid-string', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'user123', description: 'User ID from authentication system' })
  @Column({ unique: true })
  userId: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @Column({nullable: true})
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @Column({ unique: false })  
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @Column({ unique: false })  
  phone: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL', required: false })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({ example: '123 Main St, Mumbai', description: 'Default address string', required: false })
  @Column({ name: 'default_address', type: 'text', nullable: true })
  defaultAddress: string | null;
  
  @ApiProperty({ example: false,  description: 'Boolean to define dark mode', required: false })
  @Column({ nullable: true })
  isDark: boolean;

  @ApiProperty({ example: '2024-09-25T10:30:00Z', description: 'Profile creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-09-25T12:45:00Z', description: 'Profile last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}