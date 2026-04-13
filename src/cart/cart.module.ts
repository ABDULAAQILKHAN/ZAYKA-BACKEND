import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { MenuItemsModule } from '../menu-items/menu-items.module';

@Module({
  imports: [ConfigModule, MenuItemsModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
