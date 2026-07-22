import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AccountsService } from './accounts.service';
import { ListAccountsQueryDto } from './dto/list-accounts-query.dto';
import { RejectAccountDto } from './dto/reject-account.dto';
import type { Account } from './interfaces/account.interface';

@Controller('admin/accounts')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  list(@Query() query: ListAccountsQueryDto): Promise<Account[]> {
    return this.accountsService.list(query.status);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string): Promise<Account> {
    return this.accountsService.approve(id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() body: RejectAccountDto,
  ): Promise<Account> {
    return this.accountsService.reject(id, body.reason);
  }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string): Promise<Account> {
    return this.accountsService.suspend(id);
  }
}
