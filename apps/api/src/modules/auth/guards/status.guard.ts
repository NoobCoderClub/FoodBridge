import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AccountStatus } from '@repo/types';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

/** Requires `request.user.status === 'approved'`. Exempt routes simply omit this guard. */
@Injectable()
export class StatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const status = request.user?.status as AccountStatus | undefined;

    if (status !== 'approved') {
      throw new ForbiddenException('Account not approved');
    }
    return true;
  }
}
