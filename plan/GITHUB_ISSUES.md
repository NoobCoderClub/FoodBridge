# FoodBridge — GitHub Issues

Derived from [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md). Each issue below is a full implementation guide (context, step-by-step approach, edge cases, acceptance criteria) — mirrors what's live on GitHub at https://github.com/NoobCoderClub/FoodBridge/issues.

---

## M0 — Repo foundation

### #1 — Set up local Postgres via docker-compose

**Labels:** `infra` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/1

## Context

Every later milestone needs a running Postgres instance. Right now there is no database anywhere in the repo. This issue sets up the local dev database and the env var contract the rest of `apps/api` will depend on.

## Implementation guide

1. Add a `docker-compose.yml` at the repo root (not inside `apps/api`, since it's shared infra):
   ```yaml
   services:
     postgres:
       image: postgres:16
       restart: unless-stopped
       environment:
         POSTGRES_USER: foodbridge
         POSTGRES_PASSWORD: foodbridge
         POSTGRES_DB: foodbridge
       ports:
         - '5432:5432'
       volumes:
         - foodbridge_pg_data:/var/lib/postgresql/data
   volumes:
     foodbridge_pg_data:
   ```
2. Add `.env.example` at the repo root (and a copyable `apps/api/.env.example` if `apps/api` loads its own env file) with:
   ```
   DATABASE_URL=postgres://foodbridge:foodbridge@localhost:5432/foodbridge
   BETTER_AUTH_SECRET=change-me
   BETTER_AUTH_URL=http://localhost:3001
   ```
3. Add a root README section (or update `README.md`) documenting: `docker compose up -d`, then `cp .env.example .env`, then how migrations are run (cross-reference the migration-tooling issue).
4. Make sure `.env` is already in `.gitignore` (check root `.gitignore`) — don't commit real secrets.

## Edge cases / gotchas

- Use a named volume so data survives `docker compose down` (but not `down -v`).
- Pin the Postgres major version (16) so schema behavior doesn't drift between contributors' machines.

## Acceptance criteria

`docker compose up -d` starts a Postgres instance reachable at `DATABASE_URL` from `apps/api`; `.env.example` documents every variable needed to connect.

### #2 — Create `packages/types` shared package

**Labels:** `infra` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/2

## Context

`apps/api`, `apps/client`, and `apps/admin` all need to agree on the shape of `User`, `Listing`, `Claim`, `Reputation`, and their status enums. Without a shared package, these will drift out of sync between backend and frontend. This mirrors the existing `packages/ui` convention in the monorepo.

## Implementation guide

1. Scaffold `packages/types/`:
   - `package.json` — name it `@repo/types`, `"main": "src/index.ts"` (or build to `dist/` if the monorepo convention requires compiled output — check how `packages/ui` is consumed by `apps/client`/`apps/admin` and mirror that exactly).
   - `tsconfig.json` extending `packages/typescript-config/base.json`.
2. Define enums in `packages/types/src/enums.ts`:
   ```ts
   export enum UserRole {
     Poster = 'poster',
     Taker = 'taker',
     Admin = 'admin',
   }
   export enum AccountStatus {
     Pending = 'pending',
     Approved = 'approved',
     Rejected = 'rejected',
     Suspended = 'suspended',
   }
   export enum ListingStatus {
     Available = 'available',
     Claimed = 'claimed',
     Completed = 'completed',
     Expired = 'expired',
   }
   export enum ClaimStatus {
     Active = 'active',
     Completed = 'completed',
     NoShow = 'no_show',
   }
   ```
3. Define entity interfaces in `packages/types/src/entities.ts` (`User`, `Listing`, `Claim`, `Reputation`) matching the DB columns from the schema migration issue field-for-field (including nullable fields like `phone`, `completed_at`). `User` should mirror Better Auth's base `user` model (`id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`) plus the custom additional fields this project adds on top (`role`, `status`, `phone`, `verificationInfo`) — see the auth-module issue in M1 for how those additional fields are configured.
4. Export everything from `packages/types/src/index.ts`.
5. Add `"@repo/types": "workspace:*"` (or the bun-workspace equivalent already used elsewhere in the repo) as a dependency in `apps/api`, `apps/client`, `apps/admin` package.json files, then run the workspace install.

## Edge cases / gotchas

- Keep this package pure types/enums — no runtime logic, no NestJS/React imports — so it stays trivially importable from both a Node backend and a Next.js frontend.
- If DTOs need validation decorators (`class-validator`) for `apps/api` specifically, keep those in `apps/api` — don't leak backend-only decorators into the shared package that `client`/`admin` also import.
- Don't redeclare Better Auth's own session/account/verification types here — import those directly from `better-auth` where needed; this package only owns the domain entities layered on top.

## Acceptance criteria

All three apps can `import { UserRole, Listing } from "@repo/types"` and type-check successfully; `turbo build` picks up the new package in the dependency graph.

### #3 — Add `@nestjs/config` env loading

**Labels:** `api` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/3

## Context

`apps/api` currently has no environment configuration story at all — the bare `AppModule` doesn't read any env vars. Every later module (DB connection, Better Auth secret) needs a single, validated place to read config from.

## Implementation guide

1. Install `@nestjs/config` in `apps/api`.
2. Create `apps/api/src/config/configuration.ts` exporting a typed shape, e.g.:
   ```ts
   export interface AppConfig {
     databaseUrl: string;
     betterAuthSecret: string;
     betterAuthUrl: string;
   }
   ```
3. Register `ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env", validate })` in `AppModule`, where `validate` is a small function (or a `class-validator`-annotated env class) that throws on startup if `DATABASE_URL`, `BETTER_AUTH_SECRET`, or `BETTER_AUTH_URL` are missing/empty.
4. Wherever a module needs config, inject `ConfigService<AppConfig>` rather than reading `process.env` directly — this keeps config access testable and mockable. The Better Auth instance itself (see the M1 auth-module issue) also reads `betterAuthSecret`/`betterAuthUrl` through this same `ConfigService` rather than `process.env` directly.

## Edge cases / gotchas

- Fail fast: throwing during `ConfigModule.forRoot` validation (not lazily when a query first runs) means a misconfigured deploy never even boots, instead of failing confusingly on the first request.
- Don't log secret values, even at debug level.

## Acceptance criteria

Starting `apps/api` with a `.env` missing `DATABASE_URL` exits immediately with a clear error naming the missing variable; a correctly configured `.env` boots normally.

### #4 — Set up DB migration tooling + initial schema

**Labels:** `api`, `db` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/4

## Context

There is no database schema yet. Auth-related tables are owned by Better Auth (see the M1 auth-module issue), so this issue creates: the additional columns Better Auth's `user` table needs for this domain, plus the fully hand-rolled `listings`, `claims`, `reputation` tables — using a lightweight migration tool rather than an ORM (per the project's "raw SQL" decision).

## Implementation guide

1. Install `node-pg-migrate` (or an equivalent minimal SQL-migration runner) as a dev dependency of `apps/api`.
2. Add scripts to `apps/api/package.json`: `"migrate:up": "node-pg-migrate up"`, `"migrate:down": "node-pg-migrate down"`, pointed at `DATABASE_URL` from the env config.
3. Run Better Auth's own schema generation first (`npx @better-auth/cli generate`, per the M1 auth-module issue) so the `user`, `session`, `account`, `verification` tables already exist before this migration runs — this migration only `ALTER`s the `user` table and creates the domain-specific tables that reference it.
4. Create the migration under `apps/api/src/database/migrations/` with the following DDL:
   ```sql
   -- extend Better Auth's `user` table with this domain's fields
   ALTER TABLE "user"
     ADD COLUMN role text NOT NULL DEFAULT 'taker' CHECK (role IN ('poster','taker','admin')),
     ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
     ADD COLUMN phone text,
     ADD COLUMN verification_info jsonb;

   -- listings
   id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   poster_id      uuid NOT NULL REFERENCES "user"(id),
   food_type      text NOT NULL,
   quantity       numeric NOT NULL,
   quantity_unit  text NOT NULL CHECK (quantity_unit IN ('kg','servings')),
   latitude       double precision NOT NULL,
   longitude      double precision NOT NULL,
   address_approx text NOT NULL,
   address_exact  text NOT NULL,
   prepared_at    timestamptz NOT NULL,
   expires_at     timestamptz NOT NULL,
   status         text NOT NULL DEFAULT 'available' CHECK (status IN ('available','claimed','completed','expired')),
   created_at     timestamptz NOT NULL DEFAULT now()

   -- claims
   id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   listing_id      uuid NOT NULL REFERENCES listings(id),
   taker_id        uuid NOT NULL REFERENCES "user"(id),
   claimed_at      timestamptz NOT NULL DEFAULT now(),
   pickup_deadline timestamptz NOT NULL,
   status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','no_show')),
   completed_at    timestamptz

   -- reputation
   user_id         uuid PRIMARY KEY REFERENCES "user"(id),
   completed_count integer NOT NULL DEFAULT 0,
   no_show_count   integer NOT NULL DEFAULT 0,
   score           numeric NOT NULL DEFAULT 0,
   updated_at      timestamptz NOT NULL DEFAULT now()
   ```
5. Add indexes in the same (or a follow-up) migration:
   - `CREATE INDEX ON listings (status, expires_at);`
   - `CREATE INDEX ON listings (latitude, longitude);`
   - `CREATE UNIQUE INDEX claims_one_active_per_listing ON claims (listing_id) WHERE status = 'active';` — this partial unique index is what makes double-claims impossible at the DB level, independent of application logic.
6. Write the corresponding `down` migration dropping everything in reverse dependency order (drop `listings`/`claims`/`reputation` before `ALTER TABLE "user" DROP COLUMN ...`, since `listings`/`claims` reference `"user"(id)`).

## Edge cases / gotchas

- `gen_random_uuid()` requires the `pgcrypto` extension (`CREATE EXTENSION IF NOT EXISTS pgcrypto;`) — add that as the very first statement in the migration.
- This migration must run **after** Better Auth's own schema generation — order matters, since `ALTER TABLE "user"` fails if the table doesn't exist yet. Document this ordering explicitly in the migration README/scripts.
- The partial unique index is the single most important constraint in this schema — it's the real guarantee behind the "no double-claiming" requirement in the claim endpoint (see the M3 claim-locking issue).

## Acceptance criteria

Running Better Auth's schema generation followed by `migrate:up` against a fresh local Postgres produces the extended `user` table plus `listings`/`claims`/`reputation` with the constraints above; `migrate:down` cleanly rolls back to Better Auth's base schema.

### #5 — Add `common` module (exception filter, response interceptor)

**Labels:** `api` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/5

## Context

Every controller written from M1 onward will return errors and successes. Without a shared convention now, each module will invent its own response shape, making the frontend's API client harder to write consistently.

## Implementation guide

1. Create `apps/api/src/common/filters/all-exceptions.filter.ts` implementing `ExceptionFilter`, catching both `HttpException` and unknown errors, and returning a consistent JSON error shape, e.g.:
   ```json
   { "error": { "message": "...", "statusCode": 404 } }
   ```
2. Create `apps/api/src/common/interceptors/response.interceptor.ts` wrapping successful responses in a consistent envelope, e.g. `{ "data": ... }`.
3. Register both globally in `apps/api/src/main.ts` via `app.useGlobalFilters(...)` / `app.useGlobalInterceptors(...)` (not per-module), so every future controller gets this for free.
4. Log unexpected (non-`HttpException`) errors server-side with enough context (path, method) before returning the generic shape to the client — don't leak stack traces to API responses.

## Edge cases / gotchas

- Keep the error envelope shape stable from day one — frontend code in `client`/`admin` will start depending on `error.message` as soon as M1 auth forms exist.

## Acceptance criteria

An unhandled exception thrown from any controller returns the documented error envelope with an appropriate status code (not a raw stack trace); every successful response is wrapped in the documented success envelope.

---

## M1 — Auth & Approval

### #6 — Implement signup via Better Auth (poster/taker)

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/6

## Context

Per `concept.md` §3, every account starts in `pending` and cannot post or claim until an admin approves it. Rather than hand-rolling password hashing/storage, signup is built on [Better Auth](https://www.better-auth.com/)'s email/password flow — this issue is the entry point into the `pending` state machine, layered on top of Better Auth instead of a custom `users` module.

## Implementation guide

1. Install `better-auth` in `apps/api` and create `apps/api/src/auth/auth.ts` (or similar) instantiating it:
   ```ts
   export const auth = betterAuth({
     database: pool, // the same pg.Pool used elsewhere in apps/api
     emailAndPassword: { enabled: true },
     user: {
       additionalFields: {
         role: { type: 'string', required: true, defaultValue: 'taker', input: true },
         status: { type: 'string', required: true, defaultValue: 'pending', input: false },
         phone: { type: 'string', required: false },
         verificationInfo: { type: 'string', required: false }, // stored as jsonb, serialize/deserialize at the boundary
       },
     },
     advanced: { database: { generateId: false } }, // let Postgres generate uuids (see the M0 migration issue)
   });
   ```
   Setting `status`'s `input: false` prevents a signup request from setting its own status to `approved` directly through the additional-fields payload.
2. Mount Better Auth's handler in NestJS: grab the underlying Express instance (`app.getHttpAdapter().getInstance()`) in `main.ts` and register `app.all("/api/auth/*", toNodeHandler(auth))` **before** Nest's global body-parser/JSON middleware (Better Auth needs the raw request body) — this is the standard recipe for mounting Better Auth on a NestJS/Express app.
3. Signup itself is then just a call to Better Auth's built-in `POST /api/auth/sign-up/email` with `{ email, password, name, role, phone, verificationInfo }` — no custom signup controller/service needed for the core flow.
4. Add a `databaseHooks.user.create.before` hook that rejects any `role` value other than `poster`/`taker` (signup can never create an `admin` through this endpoint) and normalizes email casing.
5. Better Auth handles password hashing, minimum-length validation, and duplicate-email rejection (`422`/`409`-equivalent) internally — don't reimplement any of that.

## Edge cases / gotchas

- A newly created user must not be able to reach protected routes — since `status` defaults to `pending` and `StatusGuard` (see the next-but-one issue) checks it on every request, this falls out naturally as long as `status` truly can't be set to `approved` via the signup payload (`input: false` above).
- `verificationInfo` (business/NGO proof) isn't a Better Auth-native concept — store it as a `jsonb`-typed additional field and serialize/deserialize JSON at the DTO boundary since Better Auth's additional-fields typing is limited to primitives.

## Acceptance criteria

Signing up via `POST /api/auth/sign-up/email` creates a `pending` user with Better Auth managing the password/hashing; duplicate email is rejected by Better Auth's built-in handling; an admin/approved role or status is never accepted from the public signup payload.

### #7 — Configure Better Auth login (email/password + Bearer sessions)

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/7

## Context

Once accounts exist, users need to authenticate. Per the confirmed architecture decision, login is handled by Better Auth's built-in email/password flow with its **Bearer plugin** enabled — this avoids both a shared cookie/session-store setup _and_ hand-rolled JWT code, while still giving the two separate Next.js origins (`client` and `admin`) a simple token they can send as `Authorization: Bearer <token>`.

## Implementation guide

1. Enable the Bearer plugin on the Better Auth instance from the signup issue:
   ```ts
   import { bearer } from 'better-auth/plugins';

   export const auth = betterAuth({
     // ...database, emailAndPassword, user.additionalFields from the signup issue
     plugins: [bearer()],
     trustedOrigins: [process.env.CLIENT_URL!, process.env.ADMIN_URL!],
   });
   ```
   `trustedOrigins` must list both `apps/client`'s and `apps/admin`'s origins since they're separate Next.js deployments hitting the same `apps/api` instance.
2. Login itself is Better Auth's built-in `POST /api/auth/sign-in/email` with `{ email, password }` — no custom login controller needed. On success it returns a session; with the Bearer plugin enabled, the session token is also returned in a response header (`set-auth-token`) that the frontend reads and stores, then replays as `Authorization: Bearer <token>` on subsequent requests.
3. Better Auth verifies the password and issues/manages the session server-side (in its own `session` table) — there's no access/refresh token pair to hand-roll; the Bearer token _is_ the session reference, and Better Auth validates it against the DB (or its configured cache) on each request.
4. Session expiry/rotation is configured via Better Auth's `session` config block (e.g. `session: { expiresIn: ..., updateAge: ... }`) rather than custom JWT TTL logic.
5. Bad credentials already return a generic error from Better Auth's built-in handler — don't add custom logic that would leak whether an email exists.

## Edge cases / gotchas

- Because sessions are looked up server-side (not just a signed, stateless claim), a status change (e.g. admin suspends mid-session) can take effect immediately if `StatusGuard` (next issue) re-reads `session.user.status` on each request — this is a meaningful improvement over the stateless-JWT tradeoff the project originally had, and should be the default behavior; don't cache session data long enough to reintroduce that staleness.
- `BETTER_AUTH_SECRET` (from the M0 config issue) must be a strong, unique value per environment — it signs/encrypts Better Auth's internal session data.

## Acceptance criteria

Valid credentials via `POST /api/auth/sign-in/email` return a Bearer session token; that token is accepted by protected routes via `Authorization: Bearer <token>`; invalid credentials return a generic error; a suspended/rejected user's next authenticated request reflects their updated status without needing to wait for a token to "expire."

### #8 — Implement `RolesGuard` + `StatusGuard`

**Labels:** `api` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/8

## Context

Every business endpoint from M2 onward needs to enforce two independent things: _who_ can call it (role) and _whether they're allowed to act yet_ (approval status). This issue builds the reusable guards everything else will decorate with.

## Implementation guide

1. Add a small `AuthGuard` (or reuse a `BetterAuthModule` helper) that calls `auth.api.getSession({ headers: request.headers })` for every incoming request and attaches the result (`{ user: { id, role, status, ... } }`) to `request.session` — this replaces the old `JwtStrategy`. Because Better Auth's Bearer plugin looks up the session server-side (see the login issue), this always reflects the user's _current_ role/status, not a stale token claim.
2. `RolesGuard` — reads `request.session.user.role` and compares against a `@Roles('poster' | 'taker' | 'admin')` decorator applied to the route/controller; returns `403` on mismatch.
3. `StatusGuard` — reads `request.session.user.status` and enforces `approved` for any route decorated with `@RequireApproved()`; returns `403` with a message distinguishing `pending` ("awaiting admin approval") from `suspended` ("account suspended") so the frontend can show the right message.
4. Apply both guards globally via `APP_GUARD` providers in `AppModule`, but make them **opt-in via decorators** (i.e., routes without `@Roles(...)` are role-agnostic, routes without `@RequireApproved()` don't require approval) — Better Auth's own `/api/auth/*` routes (sign-up, sign-in) must remain accessible to `pending`/unauthenticated users, and are mounted ahead of Nest's route handling anyway (see the signup issue).
5. Write a small decorator helper file (`apps/api/src/common/decorators/roles.decorator.ts`, `require-approved.decorator.ts`) using `SetMetadata`, consistent with NestJS's standard guard/metadata pattern.

## Edge cases / gotchas

- Admins should bypass `StatusGuard` entirely (admin accounts aren't part of the pending/approved lifecycle in the same way) — decide and document this explicitly rather than leaving it implicit.
- Guard order matters: the session-lookup guard (is there a valid Bearer session at all) must run before `RolesGuard`/`StatusGuard`, which assume `request.session` is already populated.
- Calling `auth.api.getSession` on every request is a DB lookup (or cache hit, if configured) rather than a free signature check like JWT — acceptable at this project's scale, but worth knowing it's not literally free; Better Auth supports secondary storage/caching for session lookups if this ever becomes a bottleneck.

## Acceptance criteria

A `pending` user hitting a `@RequireApproved()` route gets `403` with a message indicating pending status; a `taker` hitting a `@Roles('poster')` route gets `403`; an `approved` user of the correct role passes through.

### #9 — Admin approve/reject/suspend endpoints

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/9

## Context

This is the admin side of the state machine described in `concept.md` §3: `pending → approved / rejected`, and `approved → suspended` later for fraud/no-show handling.

## Implementation guide

1. Add a small `accounts` module (`apps/api/src/accounts/`) — the home for the domain-specific admin endpoints Better Auth doesn't provide out of the box — guarded by `@Roles('admin')`:
   - `GET /admin/accounts?status=pending` — list accounts filtered by status, querying the `"user"` table directly (support `pending`/`approved`/`rejected`/`suspended` as query values for the general admin queue, not just `pending`).
   - `PATCH /admin/accounts/:id/approve` — sets the `status` additional field to `'approved'` via a raw `UPDATE "user" SET status = 'approved' WHERE id = $1`; only valid from `pending`.
   - `PATCH /admin/accounts/:id/reject` — sets `status = 'rejected'`; body includes a required `reason` string, stored (e.g. in a `rejection_reason` column, or reuse the `verification_info` jsonb additional field) so the user can be notified with context.
   - `PATCH /admin/accounts/:id/suspend` — sets `status = 'suspended'`; only valid from `approved`; body includes a required `reason`.
2. Enforce valid state transitions in the service layer (e.g. rejecting an already-`rejected` account, or suspending a `pending` account, should return `400 Bad Request`) — don't let the DB silently accept any string in the `status` column bypass this logic.
3. These endpoints write directly to Better Auth's `"user"` table via raw SQL (same as any other hand-rolled query in this project) — there's no need to route status changes through Better Auth's own API, since `role`/`status` are this project's additional fields, not something Better Auth's core auth flows need to know about.
4. Actual notification delivery (email/SMS) is out of scope for MVP — for now, persist the reason and expose it via the user's own `GET` profile/status endpoint so the frontend can display it.

## Edge cases / gotchas

- Rejecting/suspending doesn't delete the account or its data — historical listings/claims from a later-suspended user should remain intact for stats/audit purposes.

## Acceptance criteria

State transitions match `concept.md` §3 exactly (`pending→approved`, `pending→rejected`, `approved→suspended`); invalid transitions return `400`; rejected/suspended responses always carry a reason.

### #10 — Client signup/login pages

**Labels:** `client`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/10

## Context

`apps/client` currently only has the default Next.js starter page. This issue builds the first real user-facing screens: how a poster or taker actually gets into the system.

## Implementation guide

1. Install `better-auth` in `apps/client` and create a Better Auth client instance (e.g. `lib/auth-client.ts`):
   ```ts
   import { createAuthClient } from 'better-auth/react';

   export const authClient = createAuthClient({
     baseURL: process.env.NEXT_PUBLIC_API_URL, // apps/api's origin
   });
   ```
2. `/signup` — a form with role selection (poster vs taker), name/email/password/phone, and a conditional section for `verificationInfo` (business details for posters, NGO registration proof for takers), submitting via `authClient.signUp.email({ email, password, name, role, phone, verificationInfo })`.
3. `/login` — email/password form calling `authClient.signIn.email({ email, password })`; the client SDK handles reading the Bearer token from the response and can be configured to persist it (e.g. via its built-in storage) so subsequent `authClient` calls automatically attach `Authorization: Bearer <token>`.
4. For any _non_-Better-Auth API calls (listings, claims, etc. in later milestones), build a small authenticated-fetch wrapper that reads the session token from the same place `authClient` stores it, so both Better Auth calls and regular API calls stay consistent.
5. After signup, show a clear "your account is pending admin approval" state rather than silently redirecting to login as if nothing happened.
6. On login while still `pending`/`rejected`/`suspended`, surface the specific status-driven message from the API (see `StatusGuard`'s distinct messages) instead of a generic error — Better Auth's sign-in call succeeds at the auth layer regardless of this project's `status` field, so this check happens against the returned user's `status`, not as a sign-in failure.

## Edge cases / gotchas

- Don't let the signup form accept a `role=admin` value even if someone tampers with client-side form state — this must be enforced server-side (already covered by the signup endpoint issue), but the UI shouldn't offer it as an option either.

## Acceptance criteria

A user can sign up, see a "pending approval" state, and log in successfully once an admin approves them (verified end-to-end against the running API).

### #11 — Admin pending-accounts review screen

**Labels:** `admin`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/11

## Context

Admins need a UI to actually exercise the approve/reject/suspend endpoints — right now those are API-only.

## Implementation guide

1. `/accounts` — list page in `apps/admin` calling `GET /admin/accounts?status=pending` by default, with a status filter/tab to view `approved`/`rejected`/`suspended` accounts too.
2. `/accounts/[id]` — detail view showing the account's submitted info (`verification_info`) plus Approve / Reject / Suspend action buttons, each calling the corresponding admin endpoint.
3. Reject/Suspend actions must prompt for a `reason` (required field) before submitting, matching the API's required-reason contract.
4. Admin routes/pages themselves need to be protected — an unauthenticated or non-admin session should be redirected away from `/accounts*`. Set up the same Better Auth client (`createAuthClient`) in `apps/admin` as in `apps/client` (see the client signup/login issue), and check `authClient.getSession()`'s `user.role === 'admin'` before rendering these pages.

## Edge cases / gotchas

- After an approve/reject/suspend action, refresh the list/detail view from the server rather than optimistically mutating local state — admin actions are infrequent enough that correctness matters more than snappiness here.

## Acceptance criteria

An admin can view pending accounts, drill into one, and approve/reject/suspend it from the UI; the account's status visibly updates after the action.

---

## M2 — Listings

### #12 — Create listing endpoint

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/12

## Context

This is the first "core product" endpoint — an approved poster creating surplus-food listings, per `concept.md` §4 step 3.

## Implementation guide

1. Create a `listings` module (`apps/api/src/listings/`) with a repository using raw `pg` queries against the `listings` table from the M0 schema migration.
2. `POST /listings`, guarded by `@Roles('poster')` + `@RequireApproved()`. DTO fields: `foodType`, `quantity`, `quantityUnit` (`kg`|`servings`), `latitude`, `longitude`, `addressApprox`, `addressExact`, `preparedAt`, `expiresAt`.
3. Validate: `expiresAt` must be after `preparedAt` and after "now"; `quantity` must be positive; lat/lng within valid ranges (-90..90 / -180..180).
4. Insert with `poster_id = request.session.user.id` (never trust a `posterId` from the request body) and `status = 'available'`.

## Edge cases / gotchas

- `addressExact` is collected at creation time but must never be returned to non-claiming takers in any listing-read endpoint (see the address-exposure-rule issue) — don't accidentally include it in the create-response payload sent back to the poster's own UI in a way that gets logged/cached insecurely; it's fine for the poster to see their own exact address, just not other users'.

## Acceptance criteria

Only an approved poster can create a listing; the new listing starts as `available`; invalid quantity/expiry/lat-lng values are rejected with clear validation errors.

### #13 — Browse listings (distance + expiry sort)

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/13

## Context

Per `concept.md` §4 step 4, listings must be "visible only to approved takers — sorted by distance and time-to-expiry." This is the browse/discovery endpoint.

## Implementation guide

1. `GET /listings`, guarded by `@Roles('taker')` + `@RequireApproved()`, accepting the taker's current `lat`/`lng` as query params (from their device/browser geolocation).
2. Only return listings where `status = 'available'`.
3. Compute distance with a Haversine SQL expression, e.g.:
   ```sql
   SELECT *,
     (6371 * acos(
        cos(radians($lat)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians($lng)) +
        sin(radians($lat)) * sin(radians(latitude))
     )) AS distance_km
   FROM listings
   WHERE status = 'available'
   ORDER BY distance_km ASC, expires_at ASC
   ```
4. Support a `sort` query param (`distance` | `expiry`) to let the client choose primary sort key; keep the other as a stable tiebreaker.
5. Paginate (limit/offset or cursor) rather than returning every available listing unbounded.
6. Response DTO must exclude `address_exact` and the poster's phone (see the address-exposure-rule issue) — only `address_approx` and `distance_km` are included here.

## Edge cases / gotchas

- The Haversine formula above is good enough for city-scale sorting (per the confirmed architecture decision) — don't over-engineer with PostGIS.
- If a taker doesn't supply their location, decide a fallback (e.g. sort by `expires_at` only, or require the param and return `400`) — pick one and document it in the endpoint.

## Acceptance criteria

Results only include `available` listings, correctly ordered by the requested sort, and never expose `address_exact` or poster phone to a browsing (non-claiming) taker.

### #14 — Address exposure rule (approx vs exact)

**Labels:** `api` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/14

## Context

Per `concept.md` §5, before a claim exists a taker should only see an approximate/area-level location; the exact address and poster phone are privacy-sensitive fields that must never leak through a listing-read response to a non-claiming user.

## Implementation guide

1. Introduce a dedicated response serializer/DTO (e.g. `ListingPublicView`) used by `GET /listings` and `GET /listings/:id` that includes `addressApprox` but omits `addressExact` and any poster contact fields by default.
2. This is the "default" (no active claim) shape; the M3 contact-reveal issue extends the _same_ serialization path with a conditional branch that includes the sensitive fields only for the taker who holds the active claim — build this issue's DTO so that extension is a small addition, not a rewrite.
3. Add a unit/integration test asserting the public listing DTO never contains `addressExact` regardless of who's asking, unless the caller is the poster themselves or (later) the active claimant.

## Edge cases / gotchas

- Be careful with ORM-less raw SQL here: since queries are hand-written, it's easy to accidentally `SELECT *` and forward the full row to the client. Always project an explicit column list or map through the serializer DTO before responding.

## Acceptance criteria

A non-claiming taker calling `GET /listings/:id` never receives `addressExact` or poster phone in the response body, verified by a test.

### #15 — Client new-listing form

**Labels:** `client`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/15

## Context

Posters need a UI to actually create listings — this is the first "producer" screen for the core product loop.

## Implementation guide

1. `/listings/new` in `apps/client`, guarded so only an authenticated, approved poster can reach it (redirect otherwise with a clear message, reusing the pending/suspended messaging pattern from M1).
2. Form fields matching the create-listing DTO: food type, quantity + unit, prepared time, expiry time, pickup address (approx + exact), and a lat/lng input.
3. For lat/lng: a simple approach for MVP is a map click-to-pin component or a manual lat/lng input with a "use my current location" browser geolocation button — avoid pulling in a full geocoding service unless already planned elsewhere.
4. Client-side validation should mirror the API's rules (expiry after prepared time, positive quantity) so posters get instant feedback, but the API remains the source of truth.

## Edge cases / gotchas

- Since `addressExact` is entered here but hidden from other users elsewhere in the app, make sure the poster's own "my listings" view (a separate concern, not blocking this issue) is allowed to show it back to them.

## Acceptance criteria

A poster can create a listing end-to-end from the UI and it appears via the API exactly as submitted.

### #16 — Client browse feed page

**Labels:** `client`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/16

## Context

Takers need a UI to browse listings — the consumer side of the core product loop, driven by the distance/expiry-sorted `GET /listings` endpoint from this milestone.

## Implementation guide

1. `/listings` — feed page requesting the browser's geolocation (with a graceful fallback/prompt if denied), then calling `GET /listings?lat=..&lng=..&sort=distance`.
2. Each feed item shows food type, quantity, `addressApprox`, distance, and time-to-expiry — never the exact address (not available yet pre-claim).
3. `/listings/[id]` — detail view for a single listing (`GET /listings/:id`), same field visibility rules; the "Claim" action itself is built in the M3 claims milestone, but this page should already be structured to slot that button in.
4. Add a toggle/control for sort order (distance vs expiry) that re-queries the API with the corresponding `sort` param.

## Edge cases / gotchas

- Handle the empty-state (no available listings nearby) explicitly rather than showing a blank page.

## Acceptance criteria

A taker can open the feed, see nearby available listings sorted correctly, and open a detail page for one — with no exact address ever shown pre-claim.

---

## M3 — Claims + Contact reveal

### #17 — Claim endpoint with race-safe locking

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/17

## Context

This is the highest-risk piece of business logic in the whole platform: `concept.md` §4 step 5 requires that a listing "locks (no double-claiming)" the moment one taker claims it. Two takers tapping "claim" at the same instant must not both succeed.

## Implementation guide

1. `POST /listings/:id/claim`, guarded by `@Roles('taker')` + `@RequireApproved()`.
2. Run the whole operation inside a single Postgres transaction:
   ```sql
   BEGIN;
   SELECT * FROM listings WHERE id = $1 AND status = 'available' FOR UPDATE;
   -- if no row returned (already claimed/expired), ROLLBACK and return 409
   INSERT INTO claims (listing_id, taker_id, pickup_deadline)
     VALUES ($1, $2, now() + interval '...');
   UPDATE listings SET status = 'claimed' WHERE id = $1;
   COMMIT;
   ```
   The `SELECT ... FOR UPDATE` row lock is what serializes concurrent claim attempts on the _same_ listing row — the second transaction blocks until the first commits/rolls back, then sees `status != 'available'` and safely no-ops into a `409`.
3. The partial unique index from M0 (`claims(listing_id) WHERE status='active'`) is the hard backstop even if the row-lock logic above has a bug — a second `INSERT` racing past the lock (e.g. due to a code mistake) still fails at the DB constraint level rather than creating two active claims.
4. On success, set `pickup_deadline` (e.g. `expires_at` of the listing, or a fixed window from `claimed_at` — pick one and make it explicit/configurable) and return the claim including the newly revealed contact fields (see the contact-reveal issue, built on this same response).
5. Return `409 Conflict` with a clear "listing already claimed" message when the row is not `available` at claim time.

## Edge cases / gotchas

- Don't wrap the `SELECT ... FOR UPDATE` and the `INSERT`/`UPDATE` in separate connections/transactions — the lock only protects concurrent access if held for the duration of the whole read-modify-write.
- Make sure connection pooling (`pg.Pool`) hands out a single client for the whole transaction (`pool.connect()` → `client.query('BEGIN')` ... `client.query('COMMIT')` → `client.release()`), not a fresh pooled connection per statement.

## Acceptance criteria

Two concurrent claim requests against the same listing (e.g. fired via `Promise.all` in a test, see the M7 e2e-test issue) result in exactly one `201` and one `409` — never two successes.

### #18 — Auto-expire cron for unclaimed listings

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/18

## Context

Per `concept.md` §4 step 8, a listing nobody claims in time must auto-expire and get flagged as wasted — this is the data source for the later "waste hotspots" stat.

## Implementation guide

1. Install/enable `@nestjs/schedule` in `apps/api`.
2. Add a cron task (e.g. `@Cron('*/1 * * * *')` — every minute, tune interval to expected listing volume) that runs a single batched SQL update:
   ```sql
   UPDATE listings SET status = 'expired'
   WHERE status = 'available' AND expires_at < now();
   ```
3. Keep this as one statement rather than fetching rows into the app and updating one-by-one — at this scale a bulk `UPDATE ... WHERE` is both simpler and avoids N+1 round-trips.

## Edge cases / gotchas

- Make sure this cron and the M3 claim endpoint's transaction can't race in a way that expires a listing the instant after it's claimed — the `WHERE status = 'available'` guard already prevents that, since a claimed listing is no longer `available`.

## Acceptance criteria

A listing whose `expires_at` passes with no claim is automatically flipped to `expired` within one cron interval, verified against seeded test data.

### #19 — Auto-release cron for no-show claims

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/19

## Context

Per `concept.md` §4 step 9, if a taker claims but never shows up, the claim must auto-release so the listing reopens for others — this is the counterpart to the previous issue, operating on `claims` instead of unclaimed `listings`.

## Implementation guide

1. Add a second `@nestjs/schedule` cron task querying:
   ```sql
   UPDATE claims SET status = 'no_show'
   WHERE status = 'active' AND pickup_deadline < now()
   RETURNING listing_id;
   ```
2. For every `listing_id` returned, flip that listing back to `available` (a single follow-up batched `UPDATE listings SET status='available' WHERE id = ANY($1)` using the returned IDs) — do this as one additional statement, not a loop of individual updates.
3. Consider whether a released listing needs a _new_ (fresh) `expires_at`/visibility window or keeps its original expiry — pick one and document it, since an already-near-expiry listing that gets reopened may immediately re-expire via the other cron.

## Edge cases / gotchas

- This directly feeds the reliability-score logic in M5 (no-show count) — make sure the `no_show` status transition is the single place that count gets incremented from, not duplicated logic elsewhere.

## Acceptance criteria

A claim whose `pickup_deadline` passes while still `active` becomes `no_show` and its listing becomes `available` again within one cron interval.

### #20 — Contact reveal serialization rule

**Labels:** `api` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/20

## Context

Per `concept.md` §5 ("Claim-unlocks-contact"), this is the piece that actually reveals the poster's phone number and exact pickup address — but only to the taker who holds the active claim on that specific listing. It's a serialization/authorization rule layered on top of the M2 address-exposure-rule DTO, not a new module.

## Implementation guide

1. Extend the listing/claim response serializer from the M2 address-exposure-rule issue: when building a response for `GET /listings/:id` or the claim response from `POST /listings/:id/claim`, check whether `request.session.user.id` matches the `taker_id` of an `active` claim on that listing.
2. If it matches: include `addressExact` and the poster's `phone` (looked up via the listing's `poster_id`) in the response.
3. If it doesn't match (or there's no active claim): keep the M2 default (approx address only, no phone) — including for a _different_ taker who is merely browsing a listing someone else has already claimed.
4. Write this as a single shared function/method (e.g. `listingsSerializer.toResponse(listing, requestingUserId)`) reused by every endpoint that returns a listing, so the reveal rule can't be forgotten on a new endpoint later.

## Edge cases / gotchas

- The poster themselves should always be able to see their own exact address (they entered it) regardless of claim state — the check should be "requesting user is the poster OR requesting user is the active claimant," not just the claimant check alone.
- Once a claim moves to `completed` or `no_show`, decide whether contact info should still be visible in claim history (probably yes, for record-keeping) even though the listing itself is no longer `claimed`.

## Acceptance criteria

Only the poster or the active claimant ever receives `addressExact`/phone in a response; every other caller (including a different browsing taker) sees only the approximate address, verified by tests covering all three viewer types.

### #21 — Client claim button + countdown + contact reveal UI

**Labels:** `client`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/21

## Context

This is the taker-facing UI for the claim flow described in `concept.md` §4 steps 5–6: claiming a listing, seeing the pickup countdown, and getting the poster's contact info to coordinate the handoff by phone.

## Implementation guide

1. On `/listings/[id]`, add a "Claim this listing" button (visible only when `status === 'available'` and the viewer is an approved taker) calling `POST /listings/:id/claim`.
2. On success, render:
   - a live countdown to `pickup_deadline` (simple `setInterval`-driven timer component)
   - a "contact" card showing the poster's phone and exact address, sourced directly from the claim response's now-revealed fields
3. On a `409` (already claimed by someone else, e.g. a race with another browser tab), show a clear "this listing was just claimed by someone else" message rather than a generic error.
4. Add a `/my-claims` page listing the taker's own active/past claims, each linking back to its listing detail page.

## Edge cases / gotchas

- The countdown must be computed from the server's `pickup_deadline` timestamp, not a client-side timer started fresh on page load, so a page refresh doesn't reset the countdown.

## Acceptance criteria

A taker can claim an available listing, see a live countdown, and see the poster's phone/exact address; a second taker attempting to claim the same (now-claimed) listing gets a clear "already claimed" message.

---

## M4 — Completion & Stats

### #22 — Mark-completed endpoint

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/22

## Context

Per `concept.md` §4 step 7, either side marking the pickup as completed is what triggers the "kg of food saved" stat and (in M5) reputation updates.

## Implementation guide

1. `PATCH /claims/:id/complete`, guarded by `@RequireApproved()`; allow the caller if they're either the claim's `taker_id` or the listing's `poster_id` (look up both via a join, not just the claim row alone).
2. Only valid from `status = 'active'` — reject (`400`) attempts to complete an already-`completed` or `no_show` claim.
3. On success: set `claims.status = 'completed'`, `claims.completed_at = now()`, and `listings.status = 'completed'` — do both updates in a single transaction so they can't diverge if one write fails.
4. Emit whatever hook/event the M5 reputation-recompute logic needs (a direct service call is fine at this scale — no message queue needed) so completions immediately affect trust/reliability scores.

## Edge cases / gotchas

- "Either side marks it completed" means this must not require both parties to confirm — a single call from either the poster or the taker is sufficient, per the concept doc.

## Acceptance criteria

Either the poster or the taker on an active claim can mark it completed; the claim and listing status update together; invalid callers (unrelated users) or invalid states (already completed/no-show) are rejected.

### #23 — Aggregation queries (stats)

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/23

## Context

Per `concept.md` §6, the platform needs dashboard-level numbers: total kg rescued, top donors, monthly trends, and waste hotspots. These are read-only aggregate SQL queries over `listings`/`claims`.

## Implementation guide

1. `GET /stats/overview`, guarded by `@Roles('admin')` for the full dashboard (a public/lighter "impact" version for `apps/client` marketing/landing use is optional and out of scope unless separately requested).
2. Total rescued:
   ```sql
   SELECT quantity_unit, SUM(quantity) FROM listings WHERE status = 'completed' GROUP BY quantity_unit;
   ```
   (Keep `kg` and `servings` totals separate rather than summing incompatible units together.)
3. Top donors:
   ```sql
   SELECT poster_id, SUM(quantity) AS total, COUNT(*) AS listings_completed
   FROM listings WHERE status = 'completed' GROUP BY poster_id ORDER BY total DESC LIMIT 10;
   ```
4. Monthly trend:
   ```sql
   SELECT date_trunc('month', completed_at) AS month, SUM(quantity)
   FROM listings l JOIN claims c ON c.listing_id = l.id
   WHERE l.status = 'completed' GROUP BY month ORDER BY month;
   ```
5. Waste hotspots: group `expired` listings by a coarse area bucket (e.g. rounded lat/lng, or a `city`/`area` column if one exists) to find where/when waste is highest, per `concept.md` §4 step 8.

## Edge cases / gotchas

- These queries should be indexed appropriately (`listings(status)`, `listings(poster_id, status)`) — check `EXPLAIN ANALYZE` once seed data (M7) exists rather than guessing.

## Acceptance criteria

Each of the four metrics returns correct values against seeded test data (see the M7 seed-script issue) with unit tests or integration tests asserting the numbers.

### #24 — Client mark-completed action

**Labels:** `client`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/24

## Context

UI counterpart to the mark-completed endpoint — both the poster's and the taker's views of an active claim need this action available.

## Implementation guide

1. On the listing/claim detail views built in M3 (`/listings/[id]` for the taker side; whatever "my listings" view the poster uses), add a "Mark as completed" button visible only while the claim is `active` and the viewer is a party to it.
2. On success, update the UI to reflect the `completed` state (e.g. hide the claim button/countdown, show a "picked up" confirmation) without requiring a full page reload.

## Edge cases / gotchas

- Since either party can complete it, handle the case where the _other_ party already marked it completed by the time this user acts (show the already-completed state instead of erroring confusingly).

## Acceptance criteria

Both the poster and the taker on an active claim can mark it completed from their respective views, and the UI reflects the completed state afterward.

### #25 — Admin stats surfaced

**Labels:** `admin`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/25

## Context

Minimal admin-facing view of the M4 aggregation queries — a fuller dashboard build-out happens in M6, this issue just gets the numbers on screen first.

## Implementation guide

1. `/stats` page in `apps/admin` calling `GET /stats/overview` and rendering total kg/servings rescued and the top-donors list as simple tables/numbers (no charting library needed yet — that's M6's concern if desired).

## Edge cases / gotchas

- None beyond what M4's endpoint already handles — keep this issue intentionally minimal; don't scope-creep into full dashboard visuals here (see M6).

## Acceptance criteria

An admin can view total kg rescued and the top-donors list on `/stats`.

---

## M5 — Reputation

### #26 — Reputation score recompute logic

**Labels:** `api`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/26

## Context

Per `concept.md` §6, posters need a trust score (accurate quantities, honest expiry, reliability) and takers need a reliability score (show-up rate). This issue builds the recompute logic triggered by the M4 completion endpoint and the M3 no-show cron.

## Implementation guide

1. Create a `reputation` module/service with a `recompute(userId)` method operating on the `reputation` table (one row per user, created lazily on first completion/no-show if it doesn't exist yet — `INSERT ... ON CONFLICT (user_id) DO UPDATE`).
2. On claim completion (hook from the M4 mark-completed endpoint): increment `completed_count` for **both** the poster and the taker involved.
3. On claim no-show (hook from the M3 auto-release cron): increment `no_show_count` for the **taker** only (the poster didn't fail to show up).
4. Define a simple, explicit scoring formula rather than an opaque black box, e.g.:
   ```
   score = completed_count / (completed_count + no_show_count)   -- reliability ratio, 0..1
   ```
   and document it inline — this is a first-pass heuristic, not a final ML-driven trust system (out of scope).
5. Recompute and persist `updated_at` on every change; don't recompute lazily on read.

## Edge cases / gotchas

- Guard against division by zero when `completed_count + no_show_count = 0` (a brand-new user) — default to a neutral score (e.g. `null` or `1.0`, pick one and document it) rather than crashing.

## Acceptance criteria

Completing a claim increases both parties' `completed_count` and recomputes their score; a no-show increases only the taker's `no_show_count` and recomputes their score — verified against `concept.md` §6's described behavior.

### #27 — Expose reputation on user profile API

**Labels:** `api` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/27

## Context

The scores computed above need to actually reach the frontend — profile views (and later, listing/claim views showing "posted by [trust score]") depend on this.

## Implementation guide

1. Add a `GET /users/:id/profile` (or extend an existing "me" endpoint) that joins `users` with `reputation` and returns `completedCount`, `noShowCount`, `score` alongside the base profile fields.
2. Consider surfacing a summarized reputation snippet directly on listing responses (e.g. `posterTrustScore`) so `apps/client`'s browse feed can show it without a second request — optional, scope to what the frontend actually needs at this point.

## Edge cases / gotchas

- A user with no `reputation` row yet (never completed or no-showed anything) should return a sensible default (matching the neutral-score decision from the previous issue), not a `404`/null-pointer error from a missing join row — use a `LEFT JOIN` with `COALESCE` defaults.

## Acceptance criteria

Profile responses include reputation fields with sensible defaults for brand-new users, and values update immediately after a completion/no-show recompute.

---

## M6 — Admin dashboard & disputes

### #28 — Admin pending accounts queue page

**Labels:** `admin` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/28

## Context

Refinement of the basic M1 review screen into a properly usable queue for admins handling real signup volume.

## Implementation guide

1. Extend the `/accounts` page from M1 with search (by name/email) and filter controls (status, role, signup date range) against `GET /admin/accounts`.
2. Add pagination if the admin API endpoint supports it (extend `GET /admin/accounts` with `limit`/`offset` if it doesn't already, as a small follow-on to the M1 endpoint).

## Edge cases / gotchas

- Keep this additive to the M1 screen rather than a rewrite — the core approve/reject/suspend actions already work; this issue is about triage ergonomics at volume.

## Acceptance criteria

An admin can search/filter the accounts queue and page through results without the list becoming unusably long.

### #29 — Admin suspend/reactivate action

**Labels:** `admin`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/29

## Context

Per `concept.md` §3, admins can suspend an already-approved account later for repeated no-shows or fraud reports — and should be able to reverse that if it was a mistake or the issue is resolved.

## Implementation guide

1. Wire the "Suspend" action (reusing the M1 `PATCH /admin/accounts/:id/suspend` endpoint) into the account detail view for any `approved` account, with the required reason prompt.
2. Add a "Reactivate" action and corresponding API endpoint (`PATCH /admin/accounts/:id/reactivate`, `suspended → approved`) if one doesn't already exist from M1 — this issue owns adding it if missing.

## Edge cases / gotchas

- Reactivating should not reset `no_show_count`/reputation history — suspension is a status change, not a data wipe.

## Acceptance criteria

An admin can suspend an approved account (with reason) and later reactivate it, with both actions reflected immediately in the UI and via the API.

### #30 — Admin platform dashboards page

**Labels:** `admin`, `feature` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/30

## Context

Full build-out of `concept.md` §6's "platform-wide dashboards," extending the minimal M4 stats page into the real admin dashboard: total kg rescued, top donors, monthly trends, and waste hotspots.

## Implementation guide

1. Expand `/stats` (from M4) into a proper dashboard layout: summary tiles (total kg/servings rescued), a top-donors table, a monthly trend chart, and a hotspot view (table or simple map/heatmap-style grouping) — sourced from the M4 aggregation endpoint.
2. If a charting library isn't already part of the frontend stack, pick a lightweight one rather than hand-rolling SVG charts — check `packages/ui` first in case a chart primitive already exists there to reuse.

## Edge cases / gotchas

- Handle the empty/early-days state (few or no completed listings yet) gracefully rather than showing broken/empty charts.

## Acceptance criteria

All four dashboard metrics (total rescued, top donors, monthly trend, hotspots) render correctly against real API data on `/stats`.

---

## M7 — Hardening & tests

### #31 — Unit tests for core services

**Labels:** `test` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/31

## Context

Business logic in `auth`/`users`, `listings`, `claims`, and `reputation` has been built across M1–M5 without dedicated automated coverage yet. This issue closes that gap before the project is considered stable.

## Implementation guide

1. `auth`/`accounts`: signup role-restriction hook (can't self-assign `admin` or `approved` status), the `RolesGuard`/`StatusGuard` behavior built on Better Auth sessions (`pending`/`rejected`/`suspended` can't reach protected flows), admin state-transition validation.
2. `listings`: create validation (expiry-after-prepared, positive quantity), the address-exposure serializer (never leaks `addressExact` to non-claimants).
3. `claims`: the contact-reveal serializer (poster and active claimant see contact info, others don't), state-transition guards (can't complete an already-completed/no-show claim).
4. `reputation`: score recompute math, including the zero-division edge case for brand-new users.
5. Use NestJS's standard testing module (`Test.createTestingModule`) with mocked repositories where the test is about service logic, not the database itself.

## Edge cases / gotchas

- Favor testing the tricky _logic_ (state machines, serialization rules, math) over trivial CRUD pass-throughs — don't pad coverage with tests that just re-assert the ORM/driver works.

## Acceptance criteria

`turbo test` (or `apps/api`'s `test` script) passes with meaningful coverage of the state-machine and serialization logic called out above.

### #32 — E2E test for double-claim race condition

**Labels:** `test` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/32

## Context

This is the single piece of logic in the entire platform worth automated end-to-end coverage from day one, per the verification approach in the implementation plan — a regression here silently breaks the platform's core "no double-claiming" guarantee.

## Implementation guide

1. In `apps/api`'s e2e test suite (`test/`), spin up the app against a real (test) Postgres instance — this must exercise the actual DB transaction/locking behavior, not a mocked repository, since the bug class being guarded against is a genuine concurrency issue.
2. Seed one `available` listing and two approved takers.
3. Fire two `POST /listings/:id/claim` requests concurrently (e.g. `Promise.all([takerA.claim(id), takerB.claim(id)])`).
4. Assert exactly one request resolves `201 Created` and the other resolves `409 Conflict`.
5. Assert the DB ends up with exactly one row in `claims` for that `listing_id` with `status = 'active'`.
6. Run this test multiple iterations in CI if flakiness is a concern (race conditions can pass/fail non-deterministically depending on timing) — but the row-lock + partial-unique-index design from M3 should make it deterministic, not just "usually" correct.

## Edge cases / gotchas

- If this test is ever flaky, that's a signal the M3 claim endpoint's transaction handling has a real bug (e.g. connections not sharing a transaction) — don't just retry the test to make it pass.

## Acceptance criteria

The test reliably (not just "usually") shows exactly one success and one conflict across repeated runs; it fails clearly if the M3 locking logic regresses.

### #33 — Seed script for demo data

**Labels:** `chore` | **GitHub:** https://github.com/NoobCoderClub/FoodBridge/issues/33

## Context

Manual QA, demos, and the M4/M6 stats dashboards all need realistic data to look at — right now there's no way to populate a fresh local DB with anything beyond an empty schema.

## Implementation guide

1. Add a seed script (e.g. `apps/api/src/database/seed.ts`, runnable via a `bun run seed` / `npm run seed` script) that inserts:
   - a handful of `approved` posters and takers, one `pending` and one `suspended` account each (to exercise every status in the UI)
   - a spread of listings across `available`, `claimed`, `completed`, and `expired` statuses, with varied `prepared_at`/`expires_at` timestamps so the browse feed's sort and the stats dashboards have something meaningful to show
   - claims in `active`, `completed`, and `no_show` states matching the listings above
   - resulting `reputation` rows consistent with the seeded completions/no-shows (or just let the M5 recompute logic run over the seeded completions rather than hand-computing scores)
2. Make the script idempotent or clearly documented as destructive (e.g. truncates and reseeds) so it's safe to re-run during development.

## Edge cases / gotchas

- Keep seeded data internally consistent with the state machines it's exercising (e.g. don't seed a `completed` claim whose listing is still `available`) — inconsistent seed data will make the M4 stats queries and M7 tests harder to reason about, not easier.

## Acceptance criteria

Running the seed script against a freshly migrated local DB populates enough varied data that the browse feed, claim flow, and admin dashboards all have something real to display for manual QA.

---

## Future scope (backlog, not scheduled)

- [ ] Push/SMS/email notifications for nearby new listings
- [ ] NGO priority claim window
- [ ] Food-safety tagging (cooked/perishable vs packaged) auto-adjusting claim windows
- [ ] Masked/proxy contact numbers
- [ ] Waste-hotspot heatmap UI
