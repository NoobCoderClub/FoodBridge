import { useQuery } from '@tanstack/react-query';
import { listingKeys } from '@/lib/query-keys';
import { getListing } from '../api/listings.api';

export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => getListing(id),
  });
}
