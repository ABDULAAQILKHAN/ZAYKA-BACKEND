import { IsString, IsEmail, IsOptional, MinLength, IsPhoneNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ example: 'auth0|user123', description: 'User ID from authentication system' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  sub: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @Transform(({ value }) => value?.trim())
  full_name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: '+91 8989680289', description: 'Phone number' })
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  @Transform(({ value }) => value?.trim())
  phone: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  avatar?: string;

  @ApiProperty({ example: false, description: 'Boolean to define dark mode', required: false })
  @IsOptional()
  @IsBoolean()
  //@Transform(({ value }) => value === 'true' || value === true)
  isDark?: boolean;

}