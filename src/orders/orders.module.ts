import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartModule } from '../cart/cart.module';
import { AddressModule } from '../address/address.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [ConfigModule, CartModule, AddressModule, ProfileModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
