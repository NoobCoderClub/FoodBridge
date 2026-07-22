import {
  IsIn,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import type { QuantityUnit } from '@repo/types';

const QUANTITY_UNITS: QuantityUnit[] = ['kg', 'servings'];

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
}
