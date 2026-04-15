import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '../entities/table.entity';

export class UpdateTableDto {
  @ApiProperty({ enum: TableStatus, example: 'available', description: 'Table status', required: false })
  @IsOptional()
  status?: TableStatus;
}