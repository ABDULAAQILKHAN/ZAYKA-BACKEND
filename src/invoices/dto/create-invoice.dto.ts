import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'uuid-string', description: 'Order ID or Session ID' })
  @IsUUID()
  referenceId: string;

  @ApiProperty({ example: 'order', enum: ['order', 'session'] })
  @IsEnum(['order', 'session'])
  referenceType: 'order' | 'session';

  @ApiProperty({ example: 'cash', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}