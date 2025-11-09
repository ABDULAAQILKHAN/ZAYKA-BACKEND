import { IsString, IsNotEmpty, IsUrl, IsOptional, IsBoolean, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecialOfferDto {
  @ApiProperty({ description: 'Title of the special offer', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Description of the special offer' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Image URL for the special offer', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
//   @Matches(/^https?:\/\/.+/, { message: 'Image must be a valid HTTP/HTTPS URL' })
  @MaxLength(500)
  image: string;

  @ApiPropertyOptional({ description: 'Optional link for the special offer', maxLength: 500 })
  @IsOptional()
  @IsString()
//   @Matches(/^https?:\/\/.+/, { message: 'Link must be a valid HTTP/HTTPS URL' })
  @MaxLength(500)
  link?: string;

  @ApiPropertyOptional({ description: 'Whether the offer is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
