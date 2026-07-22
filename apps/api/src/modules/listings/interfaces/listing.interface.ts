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
}

export interface ListingDetail {
  id: string;
  poster_id: string;
  food_type: string;
  quantity: string;
  quantity_unit: QuantityUnit;
  latitude: number;
  longitude: number;
  address_approx: string;
  address_exact: string | null;
  prepared_at: string;
  expires_at: string;
  status: ListingStatus;
  created_at: string;
  poster_phone: string | null;
}
