import type { AccountStatus, UserRole } from '@repo/types';

export interface Account {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  phone?: string | null;
  verification_info?: Record<string, unknown> | null;
  created_at?: string;
}
