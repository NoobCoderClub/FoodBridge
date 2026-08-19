import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
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
  @Roles('member')
  listMine(@Req() req: AuthenticatedRequest) {
    return this.claimsService.listMine(req.user.id);
  }

  @Patch(':id/complete')
  @Roles('member')
  complete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.claimsService.complete(id, req.user.id);
  }
}
