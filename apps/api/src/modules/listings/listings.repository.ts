import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { CreateListingDto } from './dto/create-listing.dto';
import type { Listing, ListingDetail } from './interfaces/listing.interface';

@Injectable()
export class ListingsRepository {
  constructor(private readonly db: DatabaseService) {}

  browse(lat?: number, lng?: number): Promise<Listing[]> {
    return this.db.callFunction<Listing>('fn_browse_listings', [
      lat ?? null,
      lng ?? null,
    ]);
  }

  async getById(
    id: string,
    requesterId: string,
  ): Promise<ListingDetail | undefined> {
    const [listing] = await this.db.callFunction<ListingDetail>(
      'fn_get_listing_by_id',
      [id, requesterId],
    );
    return listing;
  }

  async create(
    posterId: string,
    dto: CreateListingDto,
  ): Promise<Omit<ListingDetail, 'poster_phone'>> {
    const [listing] = await this.db.callFunction<
      Omit<ListingDetail, 'poster_phone'>
    >('sp_create_listing', [
      posterId,
      dto.foodType,
      dto.quantity,
      dto.quantityUnit,
      dto.latitude,
      dto.longitude,
      dto.addressApprox,
      dto.addressExact,
      dto.preparedAt,
      dto.expiresAt,
    ]);
    return listing;
  }
}
