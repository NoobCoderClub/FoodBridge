import { useQuery } from '@tanstack/react-query';
import type { AccountStatus } from '@repo/types';
import { accountKeys } from '@/lib/query-keys';
import { listAccounts } from '../api/accounts.api';

/** Backs the status tabs on /accounts. */
export function useAccounts(status?: AccountStatus) {
  return useQuery({
    queryKey: accountKeys.list(status),
    queryFn: () => listAccounts(status),
  });
}
