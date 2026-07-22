import {
  Injectable,
  OnModuleDestroy,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import type { ProcedureName } from './procedure-name';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new InternalServerErrorException('DATABASE_URL is not set');
    }
    this.pool = new Pool({ connectionString });
  }

  /**
   * Calls a whitelisted `fn_*`/`sp_*` stored procedure. `name` is never
   * user input — every argument goes through `$1..$n` placeholders.
   */
  async callFunction<T extends QueryResultRow>(
    name: ProcedureName,
    params: unknown[],
  ): Promise<T[]> {
    const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
    const result = await this.pool.query<T>(
      `SELECT * FROM ${name as string}(${placeholders})`,
      params,
    );
    return result.rows;
  }

  /** For rare multi-call sequences needing app-level BEGIN/COMMIT. */
  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
