import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { TablesModule } from '../tables/tables.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [ConfigModule, TablesModule, InvoicesModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}