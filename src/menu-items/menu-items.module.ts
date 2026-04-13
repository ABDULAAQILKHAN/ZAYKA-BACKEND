import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@Module({
  imports: [ConfigModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, JwtAuthGuard, AdminRoleGuard],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
