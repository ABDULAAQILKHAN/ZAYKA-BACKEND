import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { Order } from '../orders/entities/order.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { Profile } from '../profile/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, MenuItem, Profile]),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
