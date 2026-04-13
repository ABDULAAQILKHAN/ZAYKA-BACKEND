import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { AddressModule } from './address/address.module';
import { SpecialOffersModule } from './special-offers/special-offers.module';
import { TodaysSpecialsModule } from './todays-specials/todays-specials.module';
import { MenuCategoriesModule } from './menu-categories/menu-categories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { HealthModule } from './health/health.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProfileModule,
    AddressModule,
    SpecialOffersModule,
    TodaysSpecialsModule,
    MenuCategoriesModule,
    MenuItemsModule,
    HealthModule,
    CartModule,
    OrdersModule,
    AdminDashboardModule,
  ],
})
export class AppModule {}
