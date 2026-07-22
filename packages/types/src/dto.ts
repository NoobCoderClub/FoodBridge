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
}

export interface BrowseListingsQuery {
  lat?: number;
  lng?: number;
}
