import { useQuery } from '@tanstack/react-query';
import { listingKeys } from '@/lib/query-keys';
import { listMyListings } from '../api/listings.api';

export function useMyListings() {
  return useQuery({
    queryKey: listingKeys.mine,
    queryFn: listMyListings,
  });
}
