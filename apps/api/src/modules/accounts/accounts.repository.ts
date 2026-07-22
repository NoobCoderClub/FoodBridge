import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { Account } from './interfaces/account.interface';
import type { AccountStatus } from '@repo/types';

@Injectable()
export class AccountsRepository {
  constructor(private readonly db: DatabaseService) {}

  list(status?: AccountStatus): Promise<Account[]> {
    return this.db.callFunction<Account>('fn_list_accounts', [status ?? null]);
  }

  async approve(id: string): Promise<Account> {
    const [account] = await this.db.callFunction<Account>(
      'sp_approve_account',
      [id],
    );
    return account;
  }

  async reject(id: string, reason: string): Promise<Account> {
    const [account] = await this.db.callFunction<Account>('sp_reject_account', [
      id,
      reason,
    ]);
    return account;
  }

  async suspend(id: string): Promise<Account> {
    const [account] = await this.db.callFunction<Account>(
      'sp_suspend_account',
      [id],
    );
    return account;
  }
}
