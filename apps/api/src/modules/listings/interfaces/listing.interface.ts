import type { ListingStatus, QuantityUnit } from '@repo/types';

export interface Listing {
  id: string;
  poster_id: string;
  food_type: string;
  quantity: string;
  quantity_unit: QuantityUnit;
  address_approx: string;
  prepared_at: string;
  expires_at: string;
  status: ListingStatus;
  created_at: string;
  distance_km?: number | null;
  /** Cover image, as a bucket key. Swapped for a signed URL before it leaves. */
  thumbnail_key: string | null;
}

/** A poster's own listing: every status, plus the live claim if there is one. */
export interface MyListing extends Omit<Listing, 'distance_km'> {
  active_claim_id: string | null;
}

export interface ListingDetail {
  id: string;
  poster_id: string;
  food_type: string;
  quantity: string;
  quantity_unit: QuantityUnit;
  /** Null unless the requester is the poster or holds an active claim. */
  latitude: number | null;
  longitude: number | null;
  address_approx: string;
  address_exact: string | null;
  prepared_at: string;
  expires_at: string;
  status: ListingStatus;
  created_at: string;
  poster_phone: string | null;
  active_claim_id: string | null;
  /** Whole gallery in display order, as bucket keys. */
  image_keys: string[];
}

/**
 * What the HTTP layer actually returns. Bucket keys are useless to a browser —
 * the bucket is private — so they are replaced by presigned URLs on the way out.
 */
export type WithSignedThumbnail<T extends { thumbnail_key: string | null }> =
  Omit<T, 'thumbnail_key'> & { thumbnail_url: string | null };

export type ListingResponse = WithSignedThumbnail<Listing>;
export type MyListingResponse = WithSignedThumbnail<MyListing>;
export type ListingDetailResponse = Omit<ListingDetail, 'image_keys'> & {
  image_urls: string[];
};
