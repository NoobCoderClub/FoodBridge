import { apiFetch } from '@/lib/api-client';
import type { CreateListingInput } from '../schema/listing.schema';
import type { Listing, ListingDetail } from '../types';

export function browseListings(lat?: number, lng?: number) {
  const params = new URLSearchParams();
  if (lat !== undefined) params.set('lat', String(lat));
  if (lng !== undefined) params.set('lng', String(lng));
  const query = params.toString();
  return apiFetch<Listing[]>(`/listings${query ? `?${query}` : ''}`);
}

export function getListing(id: string) {
  return apiFetch<ListingDetail>(`/listings/${id}`);
}

export function createListing(input: CreateListingInput) {
  return apiFetch<ListingDetail>('/listings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
