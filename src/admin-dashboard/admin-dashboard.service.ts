import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { Profile } from '../profile/entities/profile.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RecentOrderDto } from './dto/recent-order.dto';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Total Orders Today
    const totalOrdersToday = await this.orderRepository.count({
      where: {
        createdAt: Between(today, tomorrow),
      },
    });

    // Orders Yesterday (for comparison)
    const totalOrdersYesterday = await this.orderRepository.count({
      where: {
        createdAt: Between(yesterday, today),
      },
    });

    // Calculate percentage change for orders
    let totalOrdersComparePercentage = 0;
    if (totalOrdersYesterday > 0) {
      totalOrdersComparePercentage = Math.round(
        ((totalOrdersToday - totalOrdersYesterday) / totalOrdersYesterday) * 100
      );
    } else if (totalOrdersToday > 0) {
        totalOrdersComparePercentage = 100; // If yesterday was 0 and today is > 0
    }


    // 2. Revenue Today (Sum of total for non-cancelled orders today)
    // Assuming we only count non-cancelled orders for revenue? 
    // The requirement doesn't specify, but usually revenue implies valid orders.
    // Let's exclude CANCELLED.
    const revenueResultToday = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'sum')
      .where('order.createdAt >= :start', { start: today })
      .andWhere('order.createdAt < :end', { end: tomorrow })
      .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
      .getRawOne();
    
    const revenueToday = parseFloat(revenueResultToday.sum || '0');

    const revenueResultYesterday = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'sum')
      .where('order.createdAt >= :start', { start: yesterday })
      .andWhere('order.createdAt < :end', { end: today })
      .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
      .getRawOne();

    const revenueYesterday = parseFloat(revenueResultYesterday.sum || '0');

    // Calculate percentage change for revenue
    let revenueComparePercentage = 0;
    if (revenueYesterday > 0) {
      revenueComparePercentage = Math.round(
        ((revenueToday - revenueYesterday) / revenueYesterday) * 100
      );
    } else if (revenueToday > 0) {
        revenueComparePercentage = 100;
    }

    // 3. Active Orders Count (Pending, Preparing, Ready, Out for delivery)
    const activeOrdersCount = await this.orderRepository.count({
      where: [
        { status: OrderStatus.PENDING },
        { status: OrderStatus.PREPARING },
        { status: OrderStatus.READY },
        { status: OrderStatus.OUT_FOR_DELIVERY },
      ],
    });

    // 4. Total Menu Items
    const totalMenuItems = await this.menuItemRepository.count();

    return {
      totalOrdersToday,
      totalOrdersComparePercentage,
      revenueToday,
      revenueComparePercentage,
      activeOrdersCount,
      totalMenuItems,
    };
  }

  async getRecentOrders(limit: number): Promise<RecentOrderDto[]> {
    const orders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['items'], // Load order items to get names
    });

    // Get unique user IDs to fetch profiles
    const userIds = [...new Set(orders.map(o => o.userId).filter(id => id))];
    let profiles: Profile[] = [];
    
    if (userIds.length > 0) {
        // Using 'IN' query for profiles. 
        // Note: Profile entity has userId column.
        profiles = await this.profileRepository
            .createQueryBuilder('profile')
            .where('profile.userId IN (:...userIds)', { userIds })
            .getMany();
    }
    
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    return orders.map(order => {
        const profile = profileMap.get(order.userId);
        const customerName = profile ? profile.name : 'Guest'; // Or Unknown

        return {
            id: order.id,
            customerName,
            itemsSummary: order.items.map(item => item.name),
            totalAmount: Number(order.total), // Ensure number
            status: order.status,
            createdAt: order.createdAt as unknown as string, // TypeORM returns Date object usually
        };
    });
  }
}
