import { Controller, Get, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RecentOrderDto } from './dto/recent-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Roles('admin', 'manager') // Giving access to manager too as they likely use dashboard
@ApiBearerAuth('JWT-auth')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved', type: DashboardStatsDto })
  async getStats(): Promise<DashboardStatsDto> {
    return this.adminDashboardService.getDashboardStats();
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of orders to return (default: 3)' })
  @ApiResponse({ status: 200, description: 'Recent orders retrieved', type: [RecentOrderDto] })
  async getRecentOrders(
    @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number,
  ): Promise<RecentOrderDto[]> {
    return this.adminDashboardService.getRecentOrders(limit);
  }
}
