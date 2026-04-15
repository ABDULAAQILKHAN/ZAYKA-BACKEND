import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RecentOrderDto } from './dto/recent-order.dto';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { OrderStatus } from '../orders/entities/order.entity';
import { toCamelCase } from '../common/utils/case-mapper';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: todayOrdersData, error: todayOrdersError } = await this.client
      .from('orders')
      .select('total,status,created_at')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    handleSupabaseError(todayOrdersError, 'Failed to fetch today orders');

    const { data: yesterdayOrdersData, error: yesterdayOrdersError } = await this.client
      .from('orders')
      .select('total,status,created_at')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString());

    handleSupabaseError(yesterdayOrdersError, 'Failed to fetch yesterday orders');

    const totalOrdersToday = todayOrdersData?.length ?? 0;
    const totalOrdersYesterday = yesterdayOrdersData?.length ?? 0;

    let totalOrdersComparePercentage = 0;
    if (totalOrdersYesterday > 0) {
      totalOrdersComparePercentage = Math.round(
        ((totalOrdersToday - totalOrdersYesterday) / totalOrdersYesterday) * 100,
      );
    } else if (totalOrdersToday > 0) {
      totalOrdersComparePercentage = 100;
    }

    const revenueToday = (todayOrdersData ?? [])
      .filter((order) => order.status !== OrderStatus.CANCELLED)
      .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

    const revenueYesterday = (yesterdayOrdersData ?? [])
      .filter((order) => order.status !== OrderStatus.CANCELLED)
      .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

    let revenueComparePercentage = 0;
    if (revenueYesterday > 0) {
      revenueComparePercentage = Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100);
    } else if (revenueToday > 0) {
      revenueComparePercentage = 100;
    }

    const { count: activeOrdersCount, error: activeOrdersError } = await this.client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY]);

    handleSupabaseError(activeOrdersError, 'Failed to fetch active orders count');

    const { count: totalMenuItems, error: menuCountError } = await this.client
      .from('menu_items')
      .select('*', { count: 'exact', head: true });

    handleSupabaseError(menuCountError, 'Failed to fetch menu item count');

    return {
      totalOrdersToday,
      totalOrdersComparePercentage,
      revenueToday,
      revenueComparePercentage,
      activeOrdersCount: activeOrdersCount ?? 0,
      totalMenuItems: totalMenuItems ?? 0,
    };
  }

  async getRecentOrders(limit: number): Promise<RecentOrderDto[]> {
    const { data: orderRows, error: ordersError } = await this.client
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    handleSupabaseError(ordersError, 'Failed to fetch recent orders');
    return (orderRows ?? []).map(row => toCamelCase(row));
  }
}
