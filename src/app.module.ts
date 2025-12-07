import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
//modules
import { ProfileModule } from './profile/profile.module';
import { SpecialOffersModule } from './special-offers/special-offers.module';
import { TodaysSpecialsModule } from './todays-specials/todays-specials.module';
import { MenuCategoriesModule } from './menu-categories/menu-categories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
//entities
import { Profile } from './profile/entities/profile.entity';
import { SpecialOffer } from './special-offers/entities/special-offer.entity';
import { TodaysSpecial } from './todays-specials/entities/todays-special.entity';
import { MenuCategory } from './menu-categories/entities/menu-category.entity';
import { MenuItem } from './menu-items/entities/menu-item.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true, // makes env available everywhere
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // make sure ConfigModule is available
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl: {
          rejectUnauthorized: false, // for development only!
        },
        entities: [Profile, SpecialOffer, TodaysSpecial, MenuCategory, MenuItem],
        synchronize: true,
      }),
    }),
    ProfileModule,
    SpecialOffersModule,
    TodaysSpecialsModule,
    MenuCategoriesModule,
    MenuItemsModule,
  ],
})
export class AppModule {}
