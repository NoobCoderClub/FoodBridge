import { useQuery } from '@tanstack/react-query';
import { accountKeys } from '@/lib/query-keys';
import { listAccounts } from '../api/accounts.api';

export function usePendingAccounts() {
  return useQuery({
    queryKey: accountKeys.list('pending'),
    queryFn: () => listAccounts('pending'),
  });
}
