import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ListingsController } from './listings.controller';
import { ListingsRepository } from './listings.repository';
import { ListingsService } from './listings.service';

@Module({
  imports: [AuthModule],
  controllers: [ListingsController],
  providers: [ListingsService, ListingsRepository],
  exports: [ListingsService],
})
export class ListingsModule {}
