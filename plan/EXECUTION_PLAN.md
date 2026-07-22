# FoodBridge — Phased Build Execution Plan (M0–M7)

This is the ordered, file-level execution checklist for building FoodBridge
from its current state (pure Turborepo scaffolding) through all 8 milestones.
It is a companion to [`concept.md`](./concept.md) (product spec, the
"why/what") and [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)
(architecture, schema, stored-procedure layer, module/frontend structure,
milestone descriptions — the "how", read in full before executing; this file
assumes that context and does not repeat its §1/§2 rationale).

Any agent or session picking this up should: read `IMPLEMENTATION_PLAN.md`
first, then work through the milestones below **in order, one per session**,
checking off each milestone's verification list before starting the next.

## Starting state (as of the last audit)

- `apps/api/src/` — plain Nest scaffolding only (`app.controller.ts`,
  `app.controller.spec.ts`, `app.service.ts`, `app.module.ts`, `main.ts`).
  None of `pg`, `better-auth`, `@nestjs/config`, `@nestjs/schedule`,
  `class-validator`, `class-transformer`, `node-pg-migrate` installed.
- `apps/client/app/` and `apps/admin/app/` — default `create-next-app`
  scaffolding under a **top-level `app/` dir**, not `src/app/` as the
  architecture doc assumes (migrating to `src/` is a task below). None of
  `@tanstack/react-query`, `zod`, `better-auth/client` installed. No
  `@repo/ui` dependency wired in. No shadcn `components.json`. Tailwind v4
  CSS-first config only, no `tailwind.config.js`.
- `packages/types` does not exist yet.
- `packages/ui/src/` only has `button.tsx`, `card.tsx`, `code.tsx`.
- Root already has: `docker-compose.yml` (Postgres 16, healthy), `.env` /
  `.env.example` (**stale** — still has `JWT_ACCESS_SECRET`/
  `JWT_REFRESH_SECRET` left over from before the Better Auth decision, needs
  fixing), husky, prettier, turbo pipeline with `build`/`lint`/`check-types`/
  `dev` tasks (no `test` task yet).

Conventions used below:

- Paths relative to repo root.
- `bun` is the package manager/workspace tool; `turbo` orchestrates tasks.
- Every backend module = `*.module.ts` + `*.controller.ts` + `*.service.ts` +
  `*.repository.ts` + `dto/` + `interfaces/`. Pattern spelled out in full once
  for `listings` (M2); later modules just list filenames.
- Every stored procedure = one `.sql` file in
  `apps/api/src/database/procedures/<domain>/<name>.sql`, applied via a migration.

---

## M0 — Repo Foundation

### 0.1 Fix stale env vars

- Edit `.env.example`: replace `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` with
  `BETTER_AUTH_SECRET=change-me` and `BETTER_AUTH_URL=http://localhost:3001`.
- Mirror in `.env` (check `.gitignore` first — keep real values out of git).
- Add `PORT=3001` to both if missing; create
  `apps/client/.env.local.example` / `apps/admin/.env.local.example` with
  `NEXT_PUBLIC_API_URL=http://localhost:3001`.

### 0.2 `packages/types` workspace package

Mirrors `packages/typescript-config` conventions:

- `packages/types/package.json` — name `@repo/types`, `private: true`,
  `exports: { ".": "./src/index.ts" }`, devDeps `@repo/typescript-config`,
  `typescript`, script `check-types: tsc --noEmit`.
- `packages/types/tsconfig.json` — extends `@repo/typescript-config/base.json`.
- `packages/types/src/index.ts` — re-exports everything below.
- `packages/types/src/enums.ts` — `UserRole`, `AccountStatus`,
  `ListingStatus`, `ClaimStatus`, `QuantityUnit` per IMPLEMENTATION_PLAN §2.
- `packages/types/src/entities.ts` — `User`, `Listing`, `Claim`, `Reputation`
  interfaces per §2 schema (`User` mirrors Better Auth's base fields + our
  additional fields).
- `packages/types/src/dto.ts` — shared request/response shapes reused by api
  DTOs and frontend zod schemas (e.g. `CreateListingInput`, `BrowseListingsQuery`).
- `bun install` from root; add `@repo/types` (workspace `*`) as a dep in
  `apps/api`, `apps/client`, `apps/admin` package.json, matching the `@repo/ui` pattern.

### 0.3 `apps/api` dependencies

- `bun add pg @nestjs/config better-auth @nestjs/schedule class-validator class-transformer` in `apps/api`.
- `bun add -d node-pg-migrate @types/pg` in `apps/api`.

### 0.4 Migration tooling

- `apps/api/migrations/` (node-pg-migrate default dir), separate from
  `src/database/procedures/` (raw `.sql` bodies referenced by migrations).
- Add scripts to `apps/api/package.json`: `migrate:up`, `migrate:down`,
  `migrate:create` → `node-pg-migrate up/down/create`, configured to read
  `DATABASE_URL` from `.env` (add `dotenv` dep or `--envPath ../../.env`).
- First migration `apps/api/migrations/<ts>_init-domain-tables.js`: creates
  `listings`, `claims`, `reputation` tables + indexes
  (`listings(status, expires_at)`, `listings(latitude, longitude)`, partial
  unique `claims(listing_id) WHERE status='active'`) per §2 DDL — **skip**
  `user`/`session`/`account`/`verification` (Better Auth generates those in M1).
  Note inline: FKs to `"user"(id)` can't be created until Better Auth's `user`
  table exists in M1 — defer FK creation to a M1 follow-up migration.
- Establish **one** procedure-apply mechanism now, reused for every milestone's
  new `.sql` files: a migration step using `pgm.sql(fs.readFileSync(path))` in
  a loop over `apps/api/src/database/procedures/**/*.sql`. Don't invent a
  second mechanism later.
- Create placeholder dirs: `apps/api/src/database/procedures/{listings,claims,reputation,stats,accounts}/`.

### 0.5 `database.module.ts` / `database.service.ts`

- `apps/api/src/database/database.module.ts` — `@Global()` Nest module,
  provides `DatabaseService`, imports `ConfigModule`.
- `apps/api/src/database/database.service.ts` — wraps a `pg.Pool` from
  `ConfigService.get('DATABASE_URL')`. Exposes exactly two methods:
  `callFunction<T>(name: string, params: unknown[]): Promise<T[]>` (does
  `SELECT * FROM ${name}(${placeholders})` — **`name` only ever comes from a
  whitelist/enum of known `fn_*`/`sp_*` names, never user input**; all
  _arguments_ go through `$1..$n` placeholders) and
  `withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>` for
  rare multi-call sequences needing app-level `BEGIN`/`COMMIT`. Implements
  `OnModuleDestroy` to close the pool.

### 0.6 `common/` module

- `apps/api/src/common/filters/http-exception.filter.ts` — global `@Catch()`
  filter normalizing Nest `HttpException` + raw Postgres errors (e.g.
  unique-violation `23505` → 409 Conflict) into `{ statusCode, message, error }`.
- `apps/api/src/common/interceptors/response.interceptor.ts` — pass-through
  with timestamp logging (keeps frontend fetch code simple).
- Wire into `apps/api/src/main.ts`: `useGlobalFilters`, `useGlobalInterceptors`,
  `useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`.
- `apps/api/src/app.module.ts` — import `ConfigModule.forRoot({ isGlobal: true })`,
  `DatabaseModule`, `ScheduleModule.forRoot()` (wire now even though no cron
  jobs exist until M3, to avoid a second touch later). Repurpose
  `app.controller.ts` into a trivial `GET /health` → `{ status: 'ok' }`.

### M0 Verification

- [ ] `docker compose up -d` → `docker compose ps` shows postgres healthy
- [ ] `cd apps/api && bun run migrate:up` succeeds; `psql $DATABASE_URL -c '\dt'` shows `listings`, `claims`, `reputation`
- [ ] `bun turbo build && bun turbo check-types && bun turbo lint` all green, including `packages/types`
- [ ] `apps/api` boots (`bun run dev`), `GET /health` returns 200
- [ ] `DatabaseService` instantiates without throwing (pool connects)

---

## M1 — Auth & Approval

### 1.1 Better Auth setup

- `npx @better-auth/cli generate` from `apps/api` against `DATABASE_URL` to
  scaffold `user`/`session`/`account`/`verification` tables — review generated
  SQL before applying.
- Set `advanced.database.generateId: false` in Better Auth config **before**
  running `generate`/`migrate`, so Postgres's `gen_random_uuid()` populates
  `user.id` (keeps every FK a plain `uuid`). If already generated with default
  ids, must regenerate from scratch.
- Add `additionalFields` to Better Auth's `user` model: `role` (default
  `'taker'`), `status` (default `'pending'`), `phone` (optional),
  `verificationInfo` (jsonb, optional) — let Better Auth generate these
  columns itself; do not hand-write them as a separate migration.
- Run `npx @better-auth/cli migrate` to create the tables/columns.
- Add the deferred FK constraints from M0.4 now that `user` exists
  (`apps/api/migrations/<ts>_add-user-fks.js`).
- `apps/api/src/modules/auth/auth.module.ts` — mounts Better Auth's handler at
  `/api/auth/*`. Enable the **Bearer plugin** (`bearer()`) server-side so
  cross-origin `client`/`admin` can send `Authorization: Bearer <token>`.
- `databaseHooks.user.create.before` — force new signups to `status: 'pending'`
  regardless of client input.
- `apps/api/src/modules/auth/guards/roles.guard.ts` — reads `request.user.role`
  against a `@Roles(...)` decorator.
- `apps/api/src/modules/auth/guards/status.guard.ts` — reads
  `request.user.status`, 403 unless `'approved'` (exempt where explicitly needed).
- `apps/api/src/common/decorators/roles.decorator.ts` — `@Roles(...roles: UserRole[])` via `SetMetadata`.
- `apps/api/src/modules/auth/interfaces/authenticated-request.interface.ts` —
  extends Express `Request` with `user`/`session`.
- **Gotcha**: mount Better Auth's raw handler via `app.use('/api/auth/*', ...)`
  in `main.ts` _before_ Nest's global body parser/`ValidationPipe` touches
  that path — verify explicitly, don't assume.

### 1.2 `accounts` module (mirrors the M2 `listings` pattern)

- `apps/api/src/modules/accounts/{accounts.module.ts, accounts.controller.ts, accounts.service.ts, accounts.repository.ts, dto/{reject-account.dto.ts, list-accounts-query.dto.ts}, interfaces/account.interface.ts}`
- Controller: `GET /admin/accounts?status=pending`, `PATCH /admin/accounts/:id/approve`, `PATCH /admin/accounts/:id/reject`, `PATCH /admin/accounts/:id/suspend` — all `@Roles('admin')` + `RolesGuard`.
- Procedures: `apps/api/src/database/procedures/accounts/{fn_list_accounts.sql, sp_approve_account.sql, sp_reject_account.sql, sp_suspend_account.sql}` — each validates legal state transitions (e.g. approve only from `pending`), raising a clear exception otherwise (service maps to 409/400). Use `CREATE OR REPLACE` for idempotent re-application.

### 1.3 Frontend: client auth

- **First**, migrate `apps/client` from top-level `app/` to `src/app/`:
  `mkdir apps/client/src && git mv apps/client/app apps/client/src/app` — do
  this _before_ adding new pages so it's a clean rename commit. Repeat for `apps/admin`.
- `bun add @tanstack/react-query zod better-auth` in both apps (client SDK is
  `better-auth/client`, same package); prefer plain `fetch` over axios unless
  interceptor ergonomics are needed.
- shadcn: generate components per-app into `src/components/ui/` (not into
  shared `packages/ui`) — matches §6's per-app `components/ui/` structure;
  only promote genuinely shared primitives into `packages/ui` later if duplication becomes a problem.
- `apps/client/src/lib/{api-client.ts, query-client.ts, query-keys.ts, auth.ts, utils.ts}`:
  - `auth.ts` — `createAuthClient({ baseURL: NEXT_PUBLIC_API_URL, ... })`; **check the installed `better-auth` version's docs** for the exact client-side Bearer wiring (some versions require manually storing/attaching the token rather than it being automatic).
  - `api-client.ts` — fetch wrapper attaching `Authorization: Bearer <token>`, throws typed `ApiError` on non-2xx.
  - `query-client.ts` — one `QueryClient`, sane `staleTime` default.
  - `query-keys.ts` — start with `authKeys = { currentUser: ['auth','me'] }`.
- `apps/client/src/app/providers.tsx` — `QueryClientProvider`, mounted in `layout.tsx`.
- `apps/client/src/features/auth/{api/auth.api.ts, hooks/{use-login.ts,use-register.ts,use-current-user.ts}, components/{login-form.tsx,register-form.tsx}, schema/auth.schema.ts, types.ts}`.
- Routes: `apps/client/src/app/(auth)/login/page.tsx`, `apps/client/src/app/(auth)/signup/page.tsx` (name matches §7's page map exactly).

### 1.4 Frontend: admin auth + pending queue

- Same `src/` migration + lib scaffolding as 1.3 for `apps/admin` (login only — no self-registration; admins are seeded directly).
- `apps/admin/src/features/accounts/{api/accounts.api.ts, hooks/{use-pending-accounts.ts,use-approve-account.ts,use-reject-account.ts,use-suspend-account.ts}, components/{account-list.tsx,account-row.tsx,approve-button.tsx,reject-dialog.tsx}, types.ts}`.
- `apps/admin/src/app/(dashboard)/accounts/page.tsx` (pending queue), `.../accounts/[id]/page.tsx` (approve/reject/suspend), `.../(dashboard)/layout.tsx` (guarded shell, redirect to `/login` if unauthenticated).

### M1 Verification

- [ ] `POST /api/auth/sign-up/email` creates a user with `status='pending'`
- [ ] `POST /api/auth/sign-in/email` returns a Bearer token; protected route works with it, 401 without
- [ ] Signup then hitting a `StatusGuard`-protected route → 403 until approved
- [ ] Admin (seeded `role='admin'`, `status='approved'`) can list/approve/reject/suspend; illegal transitions rejected with a clear error
- [ ] `apps/client` signup+login work end-to-end; `apps/admin` login + pending-accounts screen work against real data
- [ ] `bun turbo build && check-types && lint` green
- [ ] Both apps now run from `src/app/`, old top-level `app/` fully removed, clean `git status`

---

## M2 — Listings

### 2.1 Procedures

- `apps/api/src/database/procedures/listings/fn_browse_listings.sql` — params `(lat, lng)`, Haversine in-query, `WHERE status='available'`, sorted by distance/expiry, returns `address_approx` only (never exact address/contact).
- `.../fn_get_listing_by_id.sql` — params `(id, requester_id)`; joins `claims` to check for an `active` claim by `requester_id`; conditionally includes `address_exact`/poster `phone` (NULL when not entitled — service treats NULL as "omit field", not an error).
- `.../sp_create_listing.sql` — validates `expires_at > prepared_at` (raise → 400), inserts, returns row. Guards already verified `role='poster'`+`status='approved'`; DB validates data invariants only.

### 2.2 `listings` module — full pattern (reference for all later modules)

- `apps/api/src/modules/listings/listings.module.ts` — registers controller/service/repository.
- `listings.controller.ts`: `POST /listings` (`@Roles('poster')`, guarded, `CreateListingDto`), `GET /listings` (`@Roles('taker')`, guarded, `BrowseListingsDto` with `lat`/`lng`), `GET /listings/:id` (guarded, any approved role).
- `listings.service.ts` — `create()`, `browse()`, `getById()`: thin pass-throughs to the repository, no business logic re-implemented.
- `listings.repository.ts` — maps each method to `DatabaseService.callFunction('sp_create_listing'|'fn_browse_listings'|'fn_get_listing_by_id', [...])`.
- `dto/create-listing.dto.ts`, `dto/browse-listings.dto.ts` — class-validator decorators for every field.
- `interfaces/listing.interface.ts` — matches `packages/types`' `Listing`, plus computed fields (`distanceKm`).
- Register in `apps/api/src/app.module.ts`.

### 2.3 Frontend: client listings feature (mirrors §6's sample `posts/` feature)

- `apps/client/src/features/listings/{api/listings.api.ts, hooks/{use-listings.ts,use-listing.ts,use-create-listing.ts}, components/{listing-list.tsx,listing-card.tsx,listing-form.tsx}, schema/listing.schema.ts, types.ts}`.
- Extend `query-keys.ts` with `listingKeys`.
- Routes: `.../listings/page.tsx` (browse, uses `navigator.geolocation` for lat/lng, graceful fallback to expiry-only sort if denied), `.../listings/new/page.tsx` (poster-only create form), `.../listings/[id]/page.tsx` (detail, no claim button yet — M3).

### M2 Verification

- [ ] `POST /listings` succeeds for approved poster; 403 for taker/unapproved poster
- [ ] `sp_create_listing` rejects `expires_at <= prepared_at`
- [ ] `GET /listings` distance-sorted, never includes `address_exact`
- [ ] `GET /listings/:id` omits exact address/phone for non-claiming taker; confirm whether owning poster always sees their own exact address
- [ ] `apps/client` browse feed + new-listing form work end-to-end, cache invalidates via `listingKeys.all`
- [ ] `bun turbo build && check-types && lint` green

---

## M3 — Claims + Contact Reveal (highest-risk milestone — race condition)

### 3.1 Procedures

- `apps/api/src/database/procedures/claims/sp_claim_listing.sql` — plpgsql body: `SELECT id FROM listings WHERE id=p_listing_id AND status='available' FOR UPDATE` (row lock), then insert claim, then update listing → `claimed`. No row found → raise (service maps to 409). The partial unique index from M0 is the second line of defense — a `23505` unique-violation must ALSO map to a friendly 409 via the M0.6 exception filter, never a raw 500.
- `.../sp_expire_listings.sql` — bulk `UPDATE listings SET status='expired' WHERE status='available' AND expires_at < now()`.
- `.../sp_release_stale_claims.sql` — bulk `UPDATE claims SET status='no_show' WHERE status='active' AND pickup_deadline < now()`, reopening the corresponding listings to `available` in the same function body.
- (`sp_complete_claim.sql` deferred to M4 to keep this milestone scoped to claim-creation + expiry/release.)

### 3.2 `claims` module

- `apps/api/src/modules/claims/{claims.module.ts, claims.controller.ts, claims.service.ts, claims.repository.ts, dto/claim-listing.dto.ts, interfaces/claim.interface.ts}`.
- `POST /listings/:id/claim` (`@Roles('taker')`, guarded) — URL is listing-scoped per §5's API table; keep the route physically in `listings.controller.ts` delegating into `ClaimsService` via constructor injection (keeps `claims.controller.ts` free for `/claims/:id/complete` in M4).
- `claims.service.ts` — `claim(listingId, takerId)` → `sp_claim_listing`, computes/returns `pickup_deadline`.
- Cron: `apps/api/src/modules/claims/claims.cron.ts` — `@Cron(CronExpression.EVERY_MINUTE)` methods calling `sp_expire_listings()`/`sp_release_stale_claims()` (via the repository). `ScheduleModule.forRoot()` already imported at root from M0.
- Finalize the contact-reveal serialization rule in `fn_get_listing_by_id` now that `claims` is live and testable end-to-end.

### 3.3 Frontend: client claims feature

- `apps/client/src/features/claims/{api/claims.api.ts, hooks/{use-claim-listing.ts,use-my-claims.ts}, components/{claim-button.tsx,countdown-timer.tsx,contact-card.tsx}, types.ts}`.
- `countdown-timer.tsx` — `"use client"`, avoid hydration mismatches: render a placeholder server-side, compute real remaining time only after mount in `useEffect`.
- Update `.../listings/[id]/page.tsx` — claim button for takers on `available` listings; show contact card + countdown once claimed by the current user.
- `apps/client/src/app/(dashboard)/my-claims/page.tsx` — taker's claims with status/countdown.

### M3 Verification (race condition is the critical check)

- [ ] Two concurrent `POST /listings/:id/claim` (fired near-simultaneously) → exactly one `201`, the other `409` with a clear message
- [ ] `psql`: after a claim, `listings.status='claimed'`, exactly one `claims` row `status='active'`
- [ ] Backdate `expires_at` → expire cron flips listing to `expired` (or trigger `sp_expire_listings()` directly to shortcut waiting)
- [ ] Backdate `pickup_deadline` → release cron flips claim to `no_show`, listing reopens to `available`
- [ ] `GET /listings/:id` shows exact address/phone to the claiming taker only
- [ ] `apps/client` claim button + countdown work with no hydration warnings
- [ ] `bun turbo build && check-types && lint` green

---

## M4 — Completion & Stats

### 4.1 Procedures

- `apps/api/src/database/procedures/claims/sp_complete_claim.sql` — single transaction: claim → `completed`, listing → `completed`, upsert `reputation` (via `sp_recompute_reputation` call at the end — see M5). **Confirm against `concept.md` whether reputation tracks taker-only or both roles before finalizing** — default assumption is taker-side (`completed_count`/`no_show_count` shape is taker-behavior-centric), flag if this needs revisiting.
- `apps/api/src/database/procedures/stats/fn_stats_overview.sql` — total kg/servings rescued (by `quantity_unit`, `status='completed'`), top donors, monthly trend (`date_trunc('month', completed_at)`), waste hotspots (expired-unclaimed grouped by `address_approx`/lat-lng bucket).

### 4.2 Wire completion into `claims` module

- `PATCH /claims/:id/complete` — pass `req.user.id` as `actor_id` into `sp_complete_claim(claim_id, actor_id)` and let the SQL function verify `actor_id IN (poster_id, taker_id)`, raising otherwise (keeps the authorization invariant in the DB, consistent with §1's architecture decision).
- `claims.service.ts`/`claims.repository.ts` — add `complete()`.

### 4.3 `stats` module

- `apps/api/src/modules/stats/{stats.module.ts, stats.controller.ts, stats.service.ts, stats.repository.ts, interfaces/stats.interface.ts}` — `GET /stats/overview`, `@Roles('admin')`. Register in `app.module.ts`.

### 4.4 Frontend

- `apps/client`: extend `features/claims` with `use-complete-claim.ts` + a "mark completed" button (poster and taker, active claim only).
- `apps/admin`: `features/stats/{api/stats.api.ts, hooks/use-stats-overview.ts, components/{stats-cards.tsx,monthly-trend-chart.tsx,top-donors-table.tsx,hotspots-table.tsx}, types.ts}`, route `.../(dashboard)/stats/page.tsx`. If charting is wanted, `recharts` is a new dependency not previously listed — confirm before adding; otherwise render tables/stat cards without a chart lib.

### M4 Verification

- [ ] `PATCH /claims/:id/complete` succeeds once by taker/poster; second call on same claim errors
- [ ] Called by an unrelated user → error from the DB-level check
- [ ] Post-completion: listing/claim both `completed`, `reputation` row exists/updated
- [ ] `GET /stats/overview` matches manual `psql` counts
- [ ] `apps/client` mark-completed works both sides; `apps/admin` stats page renders real numbers
- [ ] `bun turbo build && check-types && lint` green

---

## M5 — Reputation

### 5.1 Procedure

- `apps/api/src/database/procedures/reputation/sp_recompute_reputation.sql` — recomputes `score` from `completed_count`/`no_show_count` (e.g. `score = completed_count::numeric / GREATEST(completed_count + no_show_count, 1)` — confirm formula against `concept.md` if it specifies one).
- Ensure `sp_complete_claim` (M4) and `sp_release_stale_claims` (M3) both call this shared procedure at the end of their transaction (single source of truth for the formula) — wire `reputation.no_show_count` upsert into `sp_release_stale_claims` now if deferred earlier.

### 5.2 Expose on API responses

- Surface reputation on whatever `concept.md` implies (e.g. `posterReputation` on listing responses, or a small `fn_get_user_profile`) — add the minimal field/endpoint needed. No dedicated `reputation` Nest module unless a standalone endpoint is actually required.

### 5.3 Frontend

- Show reputation score wherever posters appear in `apps/client` (e.g. badge on `listing-card.tsx`/detail page).

### M5 Verification

- [ ] Completion recalculates `reputation.score` correctly (verify via `psql`)
- [ ] No-show increments `no_show_count`, drops `score` accordingly
- [ ] Reputation visible in `apps/client` UI
- [ ] `bun turbo build && check-types && lint` green

---

## M6 — Admin Dashboard & Disputes

### 6.1 Backend

- **`concept.md`/`IMPLEMENTATION_PLAN.md` §2 define no `disputes` table.** Re-check `concept.md` before building; if none exists, treat "disputes" as a read view over existing `no_show` claims (e.g. `fn_list_no_show_claims()` under `procedures/claims/`) rather than inventing new schema. Only add a real disputes table/module if `concept.md` is found to require it on closer reading.

### 6.2 Frontend: `apps/admin`

- `features/disputes/{api/disputes.api.ts, hooks/use-disputes.ts, components/{dispute-list.tsx,dispute-row.tsx}, types.ts}`, route `.../(dashboard)/disputes/page.tsx`.
- Add a nav shell (`components/shared/`) tying together accounts/stats/disputes into a cohesive admin dashboard.

### M6 Verification

- [ ] `apps/admin` nav works across accounts/stats/disputes
- [ ] Disputes view shows real no-show data
- [ ] Suspend/reactivate (M1) reachable and working from the dashboard
- [ ] `bun turbo build && check-types && lint` green

---

## M7 — Hardening & Tests

### 7.1 Test infrastructure

- Add a `test` task to root `turbo.json` (currently missing): `"test": { "dependsOn": ["^build"] }`.
- Extend `apps/api`'s existing Jest e2e stub config.

### 7.2 Unit tests (mock the repository — never hit a real DB in unit tests)

- Guard logic (`RolesGuard`/`StatusGuard`) with mocked execution contexts.
- `listings.service.spec.ts`, `claims.service.spec.ts` — assert service methods call the right repository method with the right args, pass through results/errors.

### 7.3 The specifically-required e2e test: double-claim race

- `apps/api/test/claims-race.e2e-spec.ts` — real Nest app against a real test Postgres (dedicated `DATABASE_URL`, e.g. `foodbridge_test`), seeds a poster/listing/two takers, fires two concurrent `POST /listings/:id/claim` via `Promise.all`, asserts exactly one `201` and one `409`, and exactly one `active` claim row in the DB. **This is the single most important test in the suite — must be genuinely concurrent, not sequential.**

### 7.4 Seed script

- `apps/api/scripts/seed.ts` — 1 admin, several approved posters/takers, listings spread across every status, matching claims, resulting reputation rows — enough to demo every screen from M1–M6 without manual setup. Add a `seed` script to `apps/api/package.json`.

### 7.5 Final hardening pass

- Re-read every `.sql` procedure for parameterization (no string concatenation of user input anywhere) and correct exception→HTTP-code mapping.
- Confirm every mutating endpoint has a `class-validator` DTO.
- Grep `apps/api/src/modules/**/*.controller.ts` for `@UseGuards` coverage gaps on role/status-gated routes.

### M7 Verification (final gate)

- [ ] `bun turbo build && check-types && lint && test` all green
- [ ] `claims-race.e2e-spec.ts` passes reliably across 5 repeated runs
- [ ] Seeded data supports a full demo walkthrough of every page in §7's page map, both apps
- [ ] Manual two-browser-session race test repeated once more as a final sanity check
- [ ] No debug leftovers, no unresolved TODOs

---

## Cross-cutting gotchas

| Gotcha                                                                                    | Where it bites            | Mitigation                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth `generateId: false` must be set before first `generate`/`migrate`             | M1                        | Set config first; if already generated with default ids, regenerate from scratch                                                                                            |
| Better Auth Bearer plugin needs server config AND client-side wiring                      | M1                        | Check the installed `better-auth` version's docs for the exact client attach mechanism — don't assume symmetric magic                                                       |
| Better Auth handler inside Nest can conflict with global body-parser/`ValidationPipe`     | M1                        | Mount Better Auth's raw handler before Nest's body parser touches `/api/auth/*`; verify explicitly                                                                          |
| node-pg-migrate + hand-written procedure `.sql` files need one consistent apply mechanism | M0, every later milestone | `pgm.sql(fs.readFileSync(...))` pattern established in M0, reused identically — never a second mechanism                                                                    |
| Claim race condition                                                                      | M3                        | `SELECT ... FOR UPDATE` is primary defense; partial unique index is the backstop — both must exist, and a `23505` from the backstop maps to a friendly 409, never a raw 500 |
| `DatabaseService.callFunction` procedure-name argument                                    | Every milestone           | Only ever a whitelisted constant/enum, never user input even indirectly                                                                                                     |
| Next.js 16 + React 19 + Tailwind v4                                                       | M1 onward (frontend)      | No `tailwind.config.js` (v4 is CSS-first); mark interactive components `"use client"`; defer time-based rendering (countdown) to `useEffect` to avoid hydration mismatches  |
| `app/` → `src/app/` migration                                                             | M1                        | `git mv` before adding new pages, for both `client` and `admin`, so it's a clean rename commit                                                                              |
| Reputation formula / disputes table not fully specified in IMPLEMENTATION_PLAN.md §2      | M5, M6                    | Cross-check `concept.md` before inventing schema/formula not in the architecture doc; flag ambiguity rather than silently deciding                                          |

## Critical files for implementation

- `apps/api/src/database/database.service.ts` — sole raw-SQL boundary; every later repository depends on `callFunction`'s contract from M0
- `apps/api/src/modules/claims/claims.repository.ts` / `.../procedures/claims/sp_claim_listing.sql` — highest-risk logic in the app (double-claim race)
- `apps/api/src/modules/auth/auth.module.ts` — Better Auth mount + Bearer wiring gates every authenticated route
- `packages/types/src/{enums.ts,entities.ts}` — shared contract for api DTOs and both frontends; get right in M0
- `apps/client/src/lib/api-client.ts` / `apps/admin/src/lib/api-client.ts` — token-attachment mechanism every feature's data-fetching depends on

## Verification approach (overall)

Each milestone above has its own checklist and must pass before the next
starts. `bun turbo build && turbo check-types && turbo lint` must stay green
after every milestone (per IMPLEMENTATION_PLAN.md §8). M3's concurrent-claim
test and M7's `claims-race.e2e-spec.ts` are the two points where correctness
must be verified by actually racing two requests, not just reading the code.
