import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingsRepository } from './listings.repository';
import type { CreateListingDto } from './dto/create-listing.dto';
import type { Listing, ListingDetail } from './interfaces/listing.interface';

@Injectable()
export class ListingsService {
  constructor(private readonly listingsRepository: ListingsRepository) {}

  browse(lat?: number, lng?: number): Promise<Listing[]> {
    return this.listingsRepository.browse(lat, lng);
  }

  async getById(id: string, requesterId: string): Promise<ListingDetail> {
    const listing = await this.listingsRepository.getById(id, requesterId);
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  create(posterId: string, dto: CreateListingDto) {
    return this.listingsRepository.create(posterId, dto);
  }
}
