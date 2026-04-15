import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

@Module({
  imports: [ConfigModule],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}