import type { Request } from 'express';
import type { AccountStatus, UserRole } from '@repo/types';
import type { auth } from '../auth.config';

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

// Better Auth's `getSession` return type doesn't reflect `user.additionalFields`
// generically, so the custom columns are added by hand here.
type SessionUser = Session['user'] & {
  role: UserRole;
  status: AccountStatus;
  phone: string | null;
  verificationInfo: Record<string, unknown> | null;
};

export interface AuthenticatedRequest extends Request {
  user: SessionUser;
  session: Session['session'];
}
