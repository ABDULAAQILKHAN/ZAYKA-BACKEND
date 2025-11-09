import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
//modules
import { ProfileModule } from './profile/profile.module';
import { SpecialOffersModule } from './special-offers/special-offers.module';
import { TodaysSpecialsModule } from './todays-specials/todays-specials.module';
//entities
import { Profile } from './profile/entities/profile.entity';
import { SpecialOffer } from './special-offers/entities/special-offer.entity';
import { TodaysSpecial } from './todays-specials/entities/todays-special.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
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
        entities: [Profile, SpecialOffer, TodaysSpecial],
        synchronize: true,
      }),
    }),
    ProfileModule,
    SpecialOffersModule,
    TodaysSpecialsModule,
  ],
})
export class AppModule {}
