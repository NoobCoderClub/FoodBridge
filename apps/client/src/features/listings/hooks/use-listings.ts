import { useQuery } from '@tanstack/react-query';
import { listingKeys } from '@/lib/query-keys';
import { browseListings } from '../api/listings.api';

export function useListings(lat?: number, lng?: number) {
  return useQuery({
    queryKey: listingKeys.browse(lat, lng),
    queryFn: () => browseListings(lat, lng),
  });
}
