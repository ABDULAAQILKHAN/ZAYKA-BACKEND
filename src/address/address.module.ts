import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Profile } from '../profile/entities/profile.entity';
import { Address } from './entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Address])],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
