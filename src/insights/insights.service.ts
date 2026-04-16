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

  async getInsights(period: string = 'week') {
    const days = period === 'month' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startIso = startDate.toISOString();

    // 1. Fetch Orders within period (excluding cancelled)
    const { data: ordersData, error: ordersError } = await this.client
      .from('orders')
      .select('*')
      .gte('created_at', startIso)
      .neq('status', 'cancelled');
    
    handleSupabaseError(ordersError, 'Failed to fetch revenue insights');
    const orders = (ordersData ?? []).map(o => toCamelCase(o));

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Order Type Breakdown
    const orderTypeBreakdown = {
      table: orders.filter(o => o.orderType === 'table').length,
      takeaway: orders.filter(o => o.orderType === 'takeaway').length,
      delivery: orders.filter(o => o.orderType === 'delivery').length,
    };

    // 3. Top Items (with revenue)
    const { data: itemsData, error: itemsError } = await this.client
      .from('order_items')
      .select('name, quantity, price, order:orders!inner(created_at, status)')
      .gte('orders.created_at', startIso)
      .neq('orders.status', 'cancelled');
    
    handleSupabaseError(itemsError, 'Failed to fetch items insights');
    
    const itemStats = new Map<string, { quantity: number, revenue: number }>();
    (itemsData ?? []).forEach(item => {
      const stats = itemStats.get(item.name) || { quantity: 0, revenue: 0 };
      itemStats.set(item.name, {
        quantity: stats.quantity + Number(item.quantity),
        revenue: stats.revenue + (Number(item.quantity) * Number(item.price)),
      });
    });

    const topItems = Array.from(itemStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 4. Table Utilization (detailed)
    // Fetch all tables
    const { data: tablesRaw, error: tablesError } = await this.client.from('tables').select('id, table_number');
    handleSupabaseError(tablesError, 'Failed to fetch table list');
    const tables = tablesRaw ?? [];

    // Fetch sessions in period
    const { data: sessionsRaw, error: sessionsError } = await this.client
      .from('sessions')
      .select('id, table_id')
      .gte('opened_at', startIso);
    handleSupabaseError(sessionsError, 'Failed to fetch session insights');
    const sessions = sessionsRaw ?? [];

    const tableUtilization = tables.map(t => {
      const tableSessions = sessions.filter(s => s.table_id === t.id);
      const tableOrders = orders.filter(o => o.tableId === t.id);
      const revenue = tableOrders.reduce((sum, o) => sum + Number(o.total), 0);

      return {
        tableNumber: t.table_number,
        sessionCount: tableSessions.length,
        totalRevenue: revenue,
      };
    });

    // 5. Daily Revenue (with orderCount)
    const dailyStatsMap = new Map<string, { revenue: number, orderCount: number }>();
    orders.forEach(o => {
      const date = o.createdAt.split('T')[0];
      const stats = dailyStatsMap.get(date) || { revenue: 0, orderCount: 0 };
      dailyStatsMap.set(date, {
        revenue: stats.revenue + Number(o.total),
        orderCount: stats.orderCount + 1,
      });
    });

    const dailyRevenue = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      orderTypeBreakdown,
      topItems,
      tableUtilization,
      dailyRevenue,
    };
  }
}