import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoriesController } from './menu-categories.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@Module({
  imports: [ConfigModule],
  controllers: [MenuCategoriesController],
  providers: [MenuCategoriesService, JwtAuthGuard, AdminRoleGuard],
  exports: [MenuCategoriesService],
})
export class MenuCategoriesModule {}
