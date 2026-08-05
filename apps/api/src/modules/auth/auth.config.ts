import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins/bearer';
import { config as loadEnv } from 'dotenv';
import { Pool } from 'pg';

// `betterAuth()` below runs at import time — main.ts imports this module before
// NestFactory bootstraps ConfigModule — so process.env is still empty at that
// point and the Pool would be built with an undefined connection string. pg
// then falls back to a passwordless default and Postgres rejects the SASL
// handshake ("client password must be a string").
//
// DatabaseService doesn't hit this because it reads through ConfigService,
// which resolves after the module graph is loaded.
//
// dotenv resolves `.env` from process.cwd() (apps/api when run by `nest start`,
// where .env is symlinked to the repo root) and never overwrites variables the
// launcher already set, so this is a no-op when the env is already populated.
loadEnv({ quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set — copy .env.example to .env at the repo root.',
  );
}

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
