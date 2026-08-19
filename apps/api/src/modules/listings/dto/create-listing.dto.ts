import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import type { QuantityUnit } from '@repo/types';

const QUANTITY_UNITS: QuantityUnit[] = ['kg', 'servings'];

/** Gallery cap, mirrored by the client-side picker. */
export const MAX_LISTING_IMAGES = 5;

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  foodType!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsIn(QUANTITY_UNITS)
  quantityUnit!: QuantityUnit;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsString()
  @IsNotEmpty()
  addressApprox!: string;

  @IsString()
  @IsNotEmpty()
  addressExact!: string;

  @IsISO8601()
  preparedAt!: string;

  @IsISO8601()
  expiresAt!: string;

  /**
   * Keys returned by `POST /uploads/listing-image/presign`, in gallery order —
   * the first is the cover. Ownership is re-checked against the caller when the
   * objects are promoted, so a key alone grants nothing.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_LISTING_IMAGES)
  @IsString({ each: true })
  imageKeys?: string[];
}
