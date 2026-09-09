import { Injectable } from '@nestjs/common';
import { ClaimsRepository } from './claims.repository';
import type { Claim, MyClaim } from './interfaces/claim.interface';

@Injectable()
export class ClaimsService {
  constructor(private readonly claimsRepository: ClaimsRepository) {}

  claim(
    listingId: string,
    takerId: string,
    pickupDeadline: string,
  ): Promise<Claim> {
    return this.claimsRepository.claim(listingId, takerId, pickupDeadline);
  }

  listMine(takerId: string): Promise<MyClaim[]> {
    return this.claimsRepository.listMine(takerId);
  }

  complete(claimId: string, actorId: string): Promise<Claim> {
    return this.claimsRepository.complete(claimId, actorId);
  }

  expireListings(): Promise<void> {
    return this.claimsRepository.expireListings();
  }

  releaseStaleClaims(): Promise<void> {
    return this.claimsRepository.releaseStaleClaims();
  }
}
