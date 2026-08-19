import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { CreateListingDto } from './dto/create-listing.dto';
import type {
  Listing,
  ListingDetail,
  MyListing,
} from './interfaces/listing.interface';

@Injectable()
export class ListingsRepository {
  constructor(private readonly db: DatabaseService) {}

  browse(viewerId: string, lat?: number, lng?: number): Promise<Listing[]> {
    return this.db.callFunction<Listing>('fn_browse_listings', [
      lat ?? null,
      lng ?? null,
      viewerId,
    ]);
  }

  listMine(posterId: string): Promise<MyListing[]> {
    return this.db.callFunction<MyListing>('fn_list_my_listings', [posterId]);
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

  /**
   * `imageKeys` are the promoted (permanent) keys, not the pending ones the
   * client sent — the service resolves those first.
   */
  async create(
    posterId: string,
    dto: CreateListingDto,
    imageKeys: string[],
  ): Promise<Omit<ListingDetail, 'poster_phone' | 'active_claim_id'>> {
    const [listing] = await this.db.callFunction<
      Omit<ListingDetail, 'poster_phone' | 'active_claim_id'>
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
      imageKeys,
    ]);
    return listing;
  }
}
