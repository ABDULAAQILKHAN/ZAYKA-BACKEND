import { Module } from '@nestjs/common';
import { TodaysSpecialsService } from './todays-specials.service';
import { TodaysSpecialsController } from './todays-specials.controller';

@Module({
  controllers: [TodaysSpecialsController],
  providers: [TodaysSpecialsService],
  exports: [TodaysSpecialsService],
})
export class TodaysSpecialsModule {}
