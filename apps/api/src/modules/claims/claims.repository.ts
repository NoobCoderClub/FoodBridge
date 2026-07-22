import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { Claim, MyClaim } from './interfaces/claim.interface';

@Injectable()
export class ClaimsRepository {
  constructor(private readonly db: DatabaseService) {}

  async claim(listingId: string, takerId: string): Promise<Claim> {
    const [claim] = await this.db.callFunction<Claim>('sp_claim_listing', [
      listingId,
      takerId,
    ]);
    return claim;
  }

  listMine(takerId: string): Promise<MyClaim[]> {
    return this.db.callFunction<MyClaim>('fn_list_my_claims', [takerId]);
  }

  async expireListings(): Promise<void> {
    await this.db.callFunction<Record<string, never>>('sp_expire_listings', []);
  }

  async releaseStaleClaims(): Promise<void> {
    await this.db.callFunction<Record<string, never>>(
      'sp_release_stale_claims',
      [],
    );
  }
}
