import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { StatsOverview } from './interfaces/stats.interface';

@Injectable()
export class StatsRepository {
  constructor(private readonly db: DatabaseService) {}

  async overview(): Promise<StatsOverview> {
    const [overview] = await this.db.callFunction<StatsOverview>(
      'fn_stats_overview',
      [],
    );
    return overview;
  }
}
