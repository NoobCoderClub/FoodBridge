import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatusGuard } from '../auth/guards/status.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { ClaimsService } from './claims.service';

@Controller('claims')
@UseGuards(AuthGuard, StatusGuard, RolesGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Get('mine')
  @Roles('taker')
  listMine(@Req() req: AuthenticatedRequest) {
    return this.claimsService.listMine(req.user.id);
  }
}
