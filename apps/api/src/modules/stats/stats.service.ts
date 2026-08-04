import { Injectable } from '@nestjs/common';
import { StatsRepository } from './stats.repository';
import type { StatsOverview } from './interfaces/stats.interface';

@Injectable()
export class StatsService {
  constructor(private readonly statsRepository: StatsRepository) {}

  overview(): Promise<StatsOverview> {
    return this.statsRepository.overview();
  }
}
