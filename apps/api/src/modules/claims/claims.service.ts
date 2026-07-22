import { Injectable } from '@nestjs/common';
import { ClaimsRepository } from './claims.repository';
import type { Claim, MyClaim } from './interfaces/claim.interface';

@Injectable()
export class ClaimsService {
  constructor(private readonly claimsRepository: ClaimsRepository) {}

  claim(listingId: string, takerId: string): Promise<Claim> {
    return this.claimsRepository.claim(listingId, takerId);
  }

  listMine(takerId: string): Promise<MyClaim[]> {
    return this.claimsRepository.listMine(takerId);
  }

  expireListings(): Promise<void> {
    return this.claimsRepository.expireListings();
  }

  releaseStaleClaims(): Promise<void> {
    return this.claimsRepository.releaseStaleClaims();
  }
}
