import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartModule } from '../cart/cart.module';
import { AddressModule } from '../address/address.module';
import { ProfileModule } from '../profile/profile.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { SessionsModule } from '../sessions/sessions.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [ConfigModule, CartModule, AddressModule, ProfileModule, MenuItemsModule, SessionsModule, InvoicesModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
