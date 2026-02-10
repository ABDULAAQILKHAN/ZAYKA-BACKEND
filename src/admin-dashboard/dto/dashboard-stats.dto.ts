import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 47, description: 'Total orders created today' })
  totalOrdersToday: number;

  @ApiProperty({ example: 12, description: 'Percentage change in orders compared to yesterday' })
  totalOrdersComparePercentage: number;

  @ApiProperty({ example: 1247.50, description: 'Total revenue for today' })
  revenueToday: number;

  @ApiProperty({ example: 8, description: 'Percentage change in revenue compared to yesterday' })
  revenueComparePercentage: number;

  @ApiProperty({ example: 8, description: 'Number of currently active orders' })
  activeOrdersCount: number;

  @ApiProperty({ example: 42, description: 'Total number of menu items' })
  totalMenuItems: number;
}
