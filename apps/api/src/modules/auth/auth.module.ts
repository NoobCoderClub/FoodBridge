import { Module } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { StatusGuard } from './guards/status.guard';

@Module({
  providers: [AuthGuard, RolesGuard, StatusGuard],
  exports: [AuthGuard, RolesGuard, StatusGuard],
})
export class AuthModule {}
