import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { MenuItem } from './entities/menu-item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem]),
    ConfigModule,
  ],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, JwtAuthGuard, AdminRoleGuard],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
