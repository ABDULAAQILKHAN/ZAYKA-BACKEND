import { ApiProperty } from '@nestjs/swagger';

export class RecentOrderDto {
  @ApiProperty({ example: 'ORD-12345', description: 'Order ID' })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'Customer Name' })
  customerName: string;

  @ApiProperty({ example: ['Butter Chicken', 'Naan'], description: 'List of item names' })
  itemsSummary: string[];

  @ApiProperty({ example: 18.98, description: 'Total amount' })
  totalAmount: number;

  @ApiProperty({ example: 'preparing', description: 'Order Status' })
  status: string;

  @ApiProperty({ example: '2023-10-27T10:30:00Z', description: 'Creation Timestamp' })
  createdAt: string;
}
