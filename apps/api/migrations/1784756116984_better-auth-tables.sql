-- Up Migration

-- Better Auth's `user`/`session`/`account`/`verification` tables, generated via
-- `better-auth generate` and hand-adjusted: `id`/`userId` columns changed from
-- `text` to `uuid` with `gen_random_uuid()` defaults (generateId: false expects
-- Postgres to generate ids), `role`/`status` CHECK constraints and defaults added
-- per the schema doc, `verificationInfo` changed to `jsonb`.

create table "user" (
  "id" uuid not null primary key default gen_random_uuid(),
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz default current_timestamp not null,
  "role" text not null default 'taker' check ("role" in ('poster', 'taker', 'admin')),
  "status" text not null default 'pending' check ("status" in ('pending', 'approved', 'rejected', 'suspended')),
  "phone" text,
  "verificationInfo" jsonb
);

create table "session" (
  "id" uuid not null primary key default gen_random_uuid(),
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" uuid not null references "user" ("id") on delete cascade
);

create table "account" (
  "id" uuid not null primary key default gen_random_uuid(),
  "accountId" text not null,
  "providerId" text not null,
  "userId" uuid not null references "user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz not null
);

create table "verification" (
  "id" uuid not null primary key default gen_random_uuid(),
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default current_timestamp not null,
  "updatedAt" timestamptz default current_timestamp not null
);

create index "session_userId_idx" on "session" ("userId");
create index "account_userId_idx" on "account" ("userId");
create index "verification_identifier_idx" on "verification" ("identifier");

-- Down Migration

drop table if exists "session";
drop table if exists "account";
drop table if exists "verification";
drop table if exists "user";
