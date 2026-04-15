import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiResponse({ status: 200, description: 'Insights retrieved successfully' })
  getInsights() {
    return this.insightsService.getInsights();
  }
}