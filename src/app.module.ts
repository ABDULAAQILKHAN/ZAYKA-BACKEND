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
import { TablesModule } from './tables/tables.module';
import { SessionsModule } from './sessions/sessions.module';
import { InvoicesModule } from './invoices/invoices.module';
import { InsightsModule } from './insights/insights.module';

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
    TablesModule,
    SessionsModule,
    InvoicesModule,
    InsightsModule,
  ],
})
export class AppModule {}
