import { IsISO8601, IsNotEmpty } from 'class-validator';

export class ClaimListingDto {
  /** ISO 8601 timestamp chosen by the taker as their intended pickup time. */
  @IsNotEmpty()
  @IsISO8601()
  pickupDeadline: string;
}
