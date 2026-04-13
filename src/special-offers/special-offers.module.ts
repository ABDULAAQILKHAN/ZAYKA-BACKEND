import { Module } from '@nestjs/common';
import { SpecialOffersService } from './special-offers.service';
import { SpecialOffersController } from './special-offers.controller';

@Module({
  controllers: [SpecialOffersController],
  providers: [SpecialOffersService],
  exports: [SpecialOffersService],
})
export class SpecialOffersModule {}
