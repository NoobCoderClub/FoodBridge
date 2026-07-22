import type { ClaimStatus } from '@repo/types';

export interface Claim {
  id: string;
  listing_id: string;
  taker_id: string;
  claimed_at: string;
  pickup_deadline: string;
  status: ClaimStatus;
}

export interface MyClaim {
  id: string;
  listing_id: string;
  claimed_at: string;
  pickup_deadline: string;
  status: ClaimStatus;
  food_type: string;
  address_approx: string;
}
