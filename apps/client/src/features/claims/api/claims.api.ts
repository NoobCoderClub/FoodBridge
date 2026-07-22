import { apiFetch } from '@/lib/api-client';
import type { Claim, MyClaim } from '../types';

export function claimListing(listingId: string) {
  return apiFetch<Claim>(`/listings/${listingId}/claim`, { method: 'POST' });
}

export function getMyClaims() {
  return apiFetch<MyClaim[]>('/claims/mine');
}
