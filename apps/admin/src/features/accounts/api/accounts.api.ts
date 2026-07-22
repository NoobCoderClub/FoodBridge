import { apiFetch } from '@/lib/api-client';
import type { AccountStatus } from '@repo/types';
import type { Account } from '../types';

export function listAccounts(status?: AccountStatus) {
  const query = status ? `?status=${status}` : '';
  return apiFetch<Account[]>(`/admin/accounts${query}`);
}

export function approveAccount(id: string) {
  return apiFetch<Account>(`/admin/accounts/${id}/approve`, {
    method: 'PATCH',
  });
}

export function rejectAccount(id: string, reason: string) {
  return apiFetch<Account>(`/admin/accounts/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export function suspendAccount(id: string) {
  return apiFetch<Account>(`/admin/accounts/${id}/suspend`, {
    method: 'PATCH',
  });
}
