import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listingKeys } from '@/lib/query-keys';
import { createListing } from '../api/listings.api';

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
}
