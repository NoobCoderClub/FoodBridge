import { Injectable } from '@nestjs/common';
import type { AccountStatus } from '@repo/types';
import { AccountsRepository } from './accounts.repository';
import type { Account } from './interfaces/account.interface';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  list(status?: AccountStatus): Promise<Account[]> {
    return this.accountsRepository.list(status);
  }

  approve(id: string): Promise<Account> {
    return this.accountsRepository.approve(id);
  }

  reject(id: string, reason: string): Promise<Account> {
    return this.accountsRepository.reject(id, reason);
  }

  suspend(id: string): Promise<Account> {
    return this.accountsRepository.suspend(id);
  }
}
