import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClaimsService } from './claims.service';

@Injectable()
export class ClaimsCron {
  private readonly logger = new Logger(ClaimsCron.name);

  constructor(private readonly claimsService: ClaimsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async expireListings() {
    try {
      await this.claimsService.expireListings();
    } catch (err) {
      this.logger.error('Failed to expire listings', err);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseStaleClaims() {
    try {
      await this.claimsService.releaseStaleClaims();
    } catch (err) {
      this.logger.error('Failed to release stale claims', err);
    }
  }
}
