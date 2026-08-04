import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatsService } from './stats.service';
import type { StatsOverview } from './interfaces/stats.interface';

@Controller('admin/stats')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  overview(): Promise<StatsOverview> {
    return this.statsService.overview();
  }
}
