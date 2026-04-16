import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@ApiTags('Insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get business insights (Admin only)' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month'], description: 'Time period for insights' })
  @ApiResponse({ status: 200, description: 'Insights retrieved successfully' })
  getInsights(@Query('period') period?: string) {
    return this.insightsService.getInsights(period);
  }
}