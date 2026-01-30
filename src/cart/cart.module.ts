import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { MenuItemsModule } from '../menu-items/menu-items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    ConfigModule,
    MenuItemsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
