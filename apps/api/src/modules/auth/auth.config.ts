import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins/bearer';
import { Pool } from 'pg';

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: [
    process.env.CLIENT_URL ?? 'http://localhost:3000',
    process.env.ADMIN_URL ?? 'http://localhost:3002',
  ],
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'taker',
        input: true,
      },
      status: {
        type: 'string',
        defaultValue: 'pending',
        input: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
      verificationInfo: {
        type: 'string',
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: (user) => {
          const requestedRole = (user as { role?: unknown }).role;
          const role = requestedRole === 'poster' ? 'poster' : 'taker';
          return Promise.resolve({
            data: {
              ...user,
              role,
              status: 'pending',
            },
          });
        },
      },
    },
  },
  plugins: [bearer()],
});
