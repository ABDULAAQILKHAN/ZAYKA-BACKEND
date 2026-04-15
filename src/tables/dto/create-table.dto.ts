import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({ example: 1, description: 'Unique table number' })
  @IsInt()
  @Min(1)
  tableNumber: number;

  @ApiProperty({ example: 4, description: 'Number of seats', required: false, default: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @ApiProperty({ example: 'near window', description: 'Table location description', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}