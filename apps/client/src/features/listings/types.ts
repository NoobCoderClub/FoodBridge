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
  /** Presigned cover-photo URL, already signed by the API. Expires. */
  thumbnail_url: string | null;
}

/** A poster's own listing — every status, plus the live claim if there is one. */
export interface MyListing extends Omit<Listing, 'distance_km'> {
  active_claim_id: string | null;
}

export interface ListingDetail {
  id: string;
  poster_id: string;
  food_type: string;
  quantity: string;
  quantity_unit: QuantityUnit;
  /** Null unless you are the poster or hold an active claim. */
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
  /** Presigned gallery URLs in display order; the first is the cover. */
  image_urls: string[];
}
