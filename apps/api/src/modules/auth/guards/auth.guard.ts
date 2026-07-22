import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.config';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

type RequestUser = AuthenticatedRequest['user'];

/**
 * Populates `request.user`/`request.session` from the Bearer token via
 * Better Auth's own session lookup. Runs first in every protected route's
 * guard chain — `RolesGuard`/`StatusGuard` assume `request.user` is already set.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Better Auth types `role`/`status` as bare `string`; our additionalFields
    // config guarantees they're always one of our enum values at runtime.
    request.user = session.user as RequestUser;
    request.session = session.session;
    return true;
  }
}
