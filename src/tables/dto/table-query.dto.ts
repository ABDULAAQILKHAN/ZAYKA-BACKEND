import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '../entities/table.entity';

export class TableQueryDto {
  @ApiProperty({ enum: TableStatus, example: 'available', description: 'Filter by status', required: false })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}