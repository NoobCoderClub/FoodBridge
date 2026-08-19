import type { QuantityUnit } from './enums';

export interface CreateListingInput {
  foodType: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  latitude: number;
  longitude: number;
  addressApprox: string;
  addressExact: string;
  preparedAt: string;
  expiresAt: string;
  /** Presigned-upload keys in gallery order; the first becomes the cover. */
  imageKeys?: string[];
}

export interface BrowseListingsQuery {
  lat?: number;
  lng?: number;
}
