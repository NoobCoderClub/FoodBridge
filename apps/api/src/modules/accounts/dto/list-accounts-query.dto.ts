import { IsIn, IsOptional } from 'class-validator';
import type { AccountStatus } from '@repo/types';

const ACCOUNT_STATUSES: AccountStatus[] = [
  'pending',
  'approved',
  'rejected',
  'suspended',
];

export class ListAccountsQueryDto {
  @IsOptional()
  @IsIn(ACCOUNT_STATUSES)
  status?: AccountStatus;
}
