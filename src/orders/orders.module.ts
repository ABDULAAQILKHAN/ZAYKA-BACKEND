import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartModule } from '../cart/cart.module';
import { AddressModule } from '../address/address.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ConfigModule,
    CartModule,
    AddressModule,
    ProfileModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
