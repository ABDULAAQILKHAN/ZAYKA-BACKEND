import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoriesController } from './menu-categories.controller';
import { MenuCategory } from './entities/menu-category.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuCategory]),
    ConfigModule,
  ],
  controllers: [MenuCategoriesController],
  providers: [MenuCategoriesService, JwtAuthGuard, AdminRoleGuard],
  exports: [MenuCategoriesService],
})
export class MenuCategoriesModule {}
