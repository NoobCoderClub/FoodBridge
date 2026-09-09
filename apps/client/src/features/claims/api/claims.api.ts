import { apiFetch } from '@/lib/api-client';
import type { Claim, MyClaim } from '../types';

export function claimListing({
  listingId,
  pickupDeadline,
}: {
  listingId: string;
  pickupDeadline: string;
}) {
  return apiFetch<Claim>(`/listings/${listingId}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pickupDeadline }),
  });
}

export function getMyClaims() {
  return apiFetch<MyClaim[]>('/claims/mine');
}

export function completeClaim(claimId: string) {
  return apiFetch<Claim>(`/claims/${claimId}/complete`, { method: 'PATCH' });
}
