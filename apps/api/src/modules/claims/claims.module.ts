import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClaimsController } from './claims.controller';
import { ClaimsCron } from './claims.cron';
import { ClaimsRepository } from './claims.repository';
import { ClaimsService } from './claims.service';

@Module({
  imports: [AuthModule],
  controllers: [ClaimsController],
  providers: [ClaimsService, ClaimsRepository, ClaimsCron],
  exports: [ClaimsService],
})
export class ClaimsModule {}
