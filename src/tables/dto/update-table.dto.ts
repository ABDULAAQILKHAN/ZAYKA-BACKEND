import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '../entities/table.entity';

export class UpdateTableDto {
  @ApiProperty({ example: 4, description: 'Number of seats', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @ApiProperty({ enum: TableStatus, example: 'available', description: 'Table status', required: false })
  @IsOptional()
  status?: TableStatus;

  @ApiProperty({ example: 'near window', description: 'Table location description', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}