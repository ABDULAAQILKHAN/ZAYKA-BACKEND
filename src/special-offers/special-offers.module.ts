import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialOffersService } from './special-offers.service';
import { SpecialOffersController } from './special-offers.controller';
import { SpecialOffer } from './entities/special-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpecialOffer])],
  controllers: [SpecialOffersController],
  providers: [SpecialOffersService],
  exports: [SpecialOffersService],
})
export class SpecialOffersModule {}
