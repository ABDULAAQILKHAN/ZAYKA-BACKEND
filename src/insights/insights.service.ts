import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAdminClient } from '../lib/supabase-server';
import { handleSupabaseError } from '../lib/supabase-mappers';
import { toCamelCase } from '../common/utils/case-mapper';

@Injectable()
export class InsightsService {
  constructor(private readonly configService: ConfigService) {}

  private get client() {
    return createAdminClient(this.configService);
  }

  async getInsights() {
    // 1. Total Revenue
    const { data: revenueData, error: revenueError } = await this.client
      .from('orders')
      .select('total')
      .neq('status', 'cancelled');
    
    handleSupabaseError(revenueError, 'Failed to fetch revenue insights');
    const totalRevenue = (revenueData ?? []).reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = (revenueData ?? []).length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Top Items
    const { data: itemsData, error: itemsError } = await this.client
      .from('order_items')
      .select('name, quantity');
    
    handleSupabaseError(itemsError, 'Failed to fetch items insights');
    
    const itemMap = new Map<string, number>();
    (itemsData ?? []).forEach(item => {
      const current = itemMap.get(item.name) || 0;
      itemMap.set(item.name, current + Number(item.quantity));
    });

    const topItems = Array.from(itemMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 3. Table Utilization
    const { data: tablesData, error: tablesError } = await this.client
      .from('tables')
      .select('status');
    
    handleSupabaseError(tablesError, 'Failed to fetch table insights');
    const occupiedTables = (tablesData ?? []).filter(t => t.status === 'occupied').length;
    const totalTables = (tablesData ?? []).length;
    const tableUtilization = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;

    // 4. Daily Revenue (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: dailyData, error: dailyError } = await this.client
      .from('orders')
      .select('total, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .neq('status', 'cancelled');

    handleSupabaseError(dailyError, 'Failed to fetch daily insights');

    const dailyRevenueMap = new Map<string, number>();
    (dailyData ?? []).forEach(o => {
      const camelOrder = toCamelCase(o);
      const date = camelOrder.createdAt.split('T')[0];
      const current = dailyRevenueMap.get(date) || 0;
      dailyRevenueMap.set(date, current + Number(camelOrder.total));
    });

    const dailyRevenue = Array.from(dailyRevenueMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topItems,
      tableUtilization,
      dailyRevenue,
    };
  }
}