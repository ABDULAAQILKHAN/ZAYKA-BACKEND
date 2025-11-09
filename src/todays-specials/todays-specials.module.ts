import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodaysSpecialsService } from './todays-specials.service';
import { TodaysSpecialsController } from './todays-specials.controller';
import { TodaysSpecial } from './entities/todays-special.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TodaysSpecial])],
  controllers: [TodaysSpecialsController],
  providers: [TodaysSpecialsService],
  exports: [TodaysSpecialsService],
})
export class TodaysSpecialsModule {}
