import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { ListingsRepository } from './listings.repository';
import type { CreateListingDto } from './dto/create-listing.dto';
import type {
  Listing,
  ListingDetailResponse,
  ListingResponse,
  MyListing,
  MyListingResponse,
} from './interfaces/listing.interface';

@Injectable()
export class ListingsService {
  constructor(
    private readonly listingsRepository: ListingsRepository,
    private readonly storageService: StorageService,
  ) {}

  async browse(
    viewerId: string,
    lat?: number,
    lng?: number,
  ): Promise<ListingResponse[]> {
    const listings = await this.listingsRepository.browse(viewerId, lat, lng);
    return Promise.all(listings.map((listing) => this.withThumbnail(listing)));
  }

  async listMine(posterId: string): Promise<MyListingResponse[]> {
    const listings = await this.listingsRepository.listMine(posterId);
    return Promise.all(listings.map((listing) => this.withThumbnail(listing)));
  }

  async getById(
    id: string,
    requesterId: string,
  ): Promise<ListingDetailResponse> {
    const listing = await this.listingsRepository.getById(id, requesterId);
    if (!listing) throw new NotFoundException('Listing not found');

    const { image_keys, ...rest } = listing;
    return {
      ...rest,
      image_urls: await this.storageService.presignDownloadMany(image_keys),
    };
  }

  /**
   * Photos are moved out of the caller's staging area *before* the row is
   * written, so a listing is never committed pointing at keys that failed to
   * copy. The reverse ordering is what needs cleaning up: if the insert fails,
   * the freshly promoted objects are unreferenced, so they are deleted here —
   * nothing sweeps the permanent prefix the way the lifecycle rule sweeps
   * `pending/`.
   */
  async create(posterId: string, dto: CreateListingDto) {
    const promoted = await this.storageService.promote(
      posterId,
      dto.imageKeys ?? [],
    );

    let listing: Awaited<ReturnType<ListingsRepository['create']>>;
    try {
      listing = await this.listingsRepository.create(posterId, dto, promoted);
    } catch (err) {
      await this.storageService.deleteObjects(promoted);
      throw err;
    }

    const { image_keys, ...rest } = listing;
    return {
      ...rest,
      image_urls: await this.storageService.presignDownloadMany(image_keys),
    };
  }

  /**
   * Feed rows carry a bucket key, which is meaningless to a browser against a
   * private bucket. Signing is local HMAC with no round-trip, so doing it per
   * card is cheap.
   */
  private async withThumbnail<T extends Listing | MyListing>(
    listing: T,
  ): Promise<Omit<T, 'thumbnail_key'> & { thumbnail_url: string | null }> {
    const { thumbnail_key, ...rest } = listing;
    return {
      ...rest,
      thumbnail_url: thumbnail_key
        ? await this.storageService.presignDownload(thumbnail_key)
        : null,
    };
  }
}
