# FoodBridge — Implementation Plan

This document turns [`concept.md`](./concept.md) into an actionable, phased build order. `concept.md` is the "why/what" (product concept); this doc is the "how/in what order."

The repo currently is pure `create-turbo` scaffolding (default Next.js pages in `apps/client`/`apps/admin`, a bare NestJS `AppModule` in `apps/api`, no database, no auth, no business modules). Everything below is new work.

---

## 1. Foundational decisions

| Area           | Decision                                                                                                                                                                                                                                                                                          | Why                                                                                                                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DB access      | **No inline SQL in application code.** Every read/write goes through a Postgres **stored procedure/function** (PL/pgSQL). `apps/api` never builds SQL strings — it only calls procedures via a thin [`pg`](https://node-postgres.com/) wrapper, e.g. `SELECT * FROM sp_create_listing($1,$2,...)` | Keeps query logic and validation living in one place (the DB), not scattered across service files; matches concept.md's "raw SQL against PostgreSQL" intent while centralizing it in reviewable, testable DB routines instead of app code                                                     |
| Business logic | Each domain operation is a **stored procedure/function** at the data layer; the NestJS **service** layer is a thin function per operation that just invokes the matching procedure and shapes the result — no business rules re-implemented in TypeScript                                         | Keeps a single source of truth for invariants (e.g. "no double-claim", status transitions) enforced where the data lives, with the service layer staying a thin, testable pass-through                                                                                                        |
| Transactions   | Any procedure touching more than one table (or requiring row locking) wraps its statements in an explicit SQL transaction (PL/pgSQL functions are atomic per call; multi-call sequences from the API use explicit `BEGIN`/`COMMIT` via a client checked out from the `pg` pool)                   | Guarantees atomicity for multi-step operations (claim locking, completion updating claim+listing+reputation together) instead of relying on app-level sequencing                                                                                                                              |
| Auth           | [Better Auth](https://www.better-auth.com/), mounted inside `apps/api`, with its Bearer plugin enabled                                                                                                                                                                                            | Handles password hashing, session/token issuance, and email/password flows out of the box instead of hand-rolled JWT code; the Bearer plugin lets the two separate Next.js origins (`client`, `admin`) authenticate via `Authorization: Bearer <token>` without cookie/cross-origin headaches |
| Geo/distance   | Plain `latitude`/`longitude` columns + Haversine formula, computed inside the browse stored procedure                                                                                                                                                                                             | Good enough for city-scale sorting; avoids a PostGIS dependency for MVP scope                                                                                                                                                                                                                 |
| Structure      | Phased milestones (M0–M7), each independently buildable/demoable                                                                                                                                                                                                                                  | Lets the project be built and tested incrementally instead of all-at-once                                                                                                                                                                                                                     |

**New dependencies introduced:**

- `apps/api`: `pg`, `@nestjs/config`, `better-auth`, `@nestjs/schedule`, `class-validator` + `class-transformer`
- `apps/client` and `apps/admin`: `@tanstack/react-query`, `zod`, `better-auth/client` (Better Auth's client SDK, per §1's Auth decision)
- New workspace package `packages/types` — shared enums (`UserRole`, `AccountStatus`, `ListingStatus`, `ClaimStatus`) and DTO/entity interfaces (`User`, `Listing`, `Claim`, `Reputation`) consumed by `api`, `client`, and `admin` — the `User` shape mirrors Better Auth's `user` model plus its custom `role`/`status`/`phone`/`verificationInfo` additional fields
- Root `docker-compose.yml` for local Postgres + `.env` / `.env.example` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- `apps/api/src/database/procedures/` — hand-written `.sql` files, one per stored procedure/function, applied as migrations alongside the schema (§2)

---

## 2. Database schema

Expands concept.md §8 into concrete DDL. The auth tables (`user`, `session`, `account`, `verification`) are generated by Better Auth's own migration CLI (`npx @better-auth/cli generate` / `migrate`), not hand-written — this section covers the **additional columns** Better Auth's `user` table needs for this domain, plus the fully hand-rolled `listings`/`claims`/`reputation` tables. Everything lives under `apps/api/src/database/migrations/`, run via a lightweight migration tool (e.g. `node-pg-migrate`) for the hand-rolled parts.

Better Auth is configured with `advanced.database.generateId: false` so Postgres generates the `user.id` column natively (`gen_random_uuid()`), keeping every foreign key below a plain `uuid` consistent with the rest of the schema.

```sql
-- user (base columns generated by Better Auth's own migration CLI: id, name, email,
-- emailVerified, image, createdAt, updatedAt — password hashes live in Better Auth's
-- own `account` table, not here)
-- additional columns added by our follow-up migration, via Better Auth's `additionalFields` config:
role                text NOT NULL DEFAULT 'taker' CHECK (role IN ('poster','taker','admin'))
status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended'))
phone               text
verification_info   jsonb            -- business details / NGO registration proof

-- listings
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
poster_id           uuid NOT NULL REFERENCES "user"(id)
food_type           text NOT NULL
quantity            numeric NOT NULL
quantity_unit       text NOT NULL CHECK (quantity_unit IN ('kg','servings'))
latitude            double precision NOT NULL
longitude           double precision NOT NULL
address_approx      text NOT NULL   -- area-level, always visible
address_exact       text NOT NULL   -- exact pickup address, revealed on claim
prepared_at         timestamptz NOT NULL
expires_at          timestamptz NOT NULL
status              text NOT NULL DEFAULT 'available' CHECK (status IN ('available','claimed','completed','expired'))
created_at          timestamptz NOT NULL DEFAULT now()

-- claims
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
listing_id          uuid NOT NULL REFERENCES listings(id)
taker_id            uuid NOT NULL REFERENCES "user"(id)
claimed_at          timestamptz NOT NULL DEFAULT now()
pickup_deadline     timestamptz NOT NULL
status              text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','no_show'))
completed_at        timestamptz

-- reputation
user_id             uuid PRIMARY KEY REFERENCES "user"(id)
completed_count     integer NOT NULL DEFAULT 0
no_show_count       integer NOT NULL DEFAULT 0
score               numeric NOT NULL DEFAULT 0
updated_at          timestamptz NOT NULL DEFAULT now()
```

**Indexes / constraints:**

- `listings(status, expires_at)` — fast lookup of live/expiring listings for browse + the auto-expire cron
- `listings(latitude, longitude)` — supports the Haversine distance sort
- Partial unique index `claims(listing_id) WHERE status = 'active'` — enforces "no double-claim" at the DB level, not just app logic

**Stored procedures/functions** — one `.sql` file per routine under `apps/api/src/database/procedures/<domain>/`, each a `plpgsql` routine returning the row(s) the calling repository needs. Naming follows read/write: **`fn_`** for read-only functions, **`sp_`** for anything that writes:

| Procedure                                                                                                       | Folder        | Used by module  | Notes                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------- | ------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_browse_listings(lat, lng)`                                                                                  | `listings/`   | Listings (M2)   | Haversine distance computed in-query, filters `status = 'available'`, sorts by distance/expiry                                                                                                  |
| `fn_get_listing_by_id(id, requester_id)`                                                                        | `listings/`   | Listings (M2)   | Returns `address_exact`/phone only when `requester_id` has an active claim on the listing                                                                                                       |
| `sp_create_listing(...)`                                                                                        | `listings/`   | Listings (M2)   | Validates `expires_at > prepared_at`, inserts, returns the row                                                                                                                                  |
| `sp_claim_listing(listing_id, taker_id)`                                                                        | `claims/`     | Claims (M3)     | `SELECT ... FOR UPDATE` + insert claim + update listing status, all inside one `plpgsql` function body — atomic by construction, backed by the partial unique index as a second line of defense |
| `sp_complete_claim(claim_id, actor_id)`                                                                         | `claims/`     | Completion (M4) | Updates claim → `completed`, listing → `completed`, upserts `reputation` — one explicit transaction across all three                                                                            |
| `sp_expire_listings()`                                                                                          | `claims/`     | Cron (M3)       | Bulk-updates listings past `expires_at` with no active claim → `expired`                                                                                                                        |
| `sp_release_stale_claims()`                                                                                     | `claims/`     | Cron (M3)       | Bulk-updates claims past `pickup_deadline` still `active` → `no_show`, reopens the listing                                                                                                      |
| `sp_recompute_reputation(user_id)`                                                                              | `reputation/` | Reputation (M5) | Recomputes `score` from `completed_count`/`no_show_count`                                                                                                                                       |
| `fn_stats_overview()`                                                                                           | `stats/`      | Stats (M4/M6)   | Aggregation query: total kg/servings, top donors, monthly trend, waste hotspots                                                                                                                 |
| `fn_list_accounts(status)`, `sp_approve_account(id)`, `sp_reject_account(id, reason)`, `sp_suspend_account(id)` | `accounts/`   | Accounts (M1)   | Drive the `pending → approved/rejected/suspended` state machine on Better Auth's `user` table additional fields                                                                                 |

---

## 3. Backend architecture

`apps/api/src/` follows a strict layering rule enforcing §1's "no inline SQL, thin service" decisions: **only one file per module — `<name>.repository.ts` — is allowed to call `DatabaseService`**, and `DatabaseService` itself is the **only** place in the whole app that issues raw SQL, and even there only ever `SELECT * FROM fn_x(...)` / `CALL sp_x(...)`-style calls into the procedures from §2 — never a hand-built query.

```
apps/api/src/
├── main.ts
├── app.module.ts
│
├── database/
│   ├── database.module.ts
│   ├── database.service.ts          # only place with raw sql (calls to fn_/sp_ only)
│   └── procedures/
│       ├── listings/
│       │   ├── fn_browse_listings.sql
│       │   ├── fn_get_listing_by_id.sql
│       │   └── sp_create_listing.sql
│       ├── claims/
│       │   ├── sp_claim_listing.sql
│       │   ├── sp_complete_claim.sql
│       │   ├── sp_expire_listings.sql
│       │   └── sp_release_stale_claims.sql
│       ├── reputation/
│       │   └── sp_recompute_reputation.sql
│       ├── stats/
│       │   └── fn_stats_overview.sql
│       └── accounts/
│           ├── fn_list_accounts.sql
│           ├── sp_approve_account.sql
│           ├── sp_reject_account.sql
│           └── sp_suspend_account.sql
│
├── modules/
│   ├── listings/
│   │   ├── listings.module.ts
│   │   ├── listings.controller.ts
│   │   ├── listings.service.ts        # business logic as functions
│   │   ├── listings.repository.ts     # only file in this module that touches DatabaseService
│   │   ├── dto/
│   │   │   ├── create-listing.dto.ts
│   │   │   └── browse-listings.dto.ts
│   │   └── interfaces/
│   │       └── listing.interface.ts
│   │
│   ├── claims/
│   │   ├── claims.module.ts
│   │   ├── claims.controller.ts
│   │   ├── claims.service.ts
│   │   ├── claims.repository.ts
│   │   ├── dto/
│   │   └── interfaces/
│   │
│   ├── accounts/                      # admin approve/reject/suspend + pending queue
│   │   ├── accounts.module.ts
│   │   ├── accounts.controller.ts
│   │   ├── accounts.service.ts
│   │   ├── accounts.repository.ts
│   │   ├── dto/
│   │   └── interfaces/
│   │
│   ├── stats/
│   │   ├── stats.module.ts
│   │   ├── stats.controller.ts
│   │   ├── stats.service.ts
│   │   ├── stats.repository.ts
│   │   └── interfaces/
│   │
│   └── auth/                          # Better Auth mount + RolesGuard/StatusGuard
│       ├── auth.module.ts
│       ├── auth.controller.ts         # thin wrapper only where Better Auth needs a custom hook
│       └── guards/
│           ├── roles.guard.ts
│           └── status.guard.ts
│
└── common/
    ├── filters/
    ├── interceptors/
    ├── guards/
    └── decorators/
```

Layering rule, top to bottom: `*.controller.ts` (HTTP + DTO validation) → `*.service.ts` (business logic as thin functions, one per operation, per §1's "Business logic" decision) → `*.repository.ts` (translates service calls into `DatabaseService.call('fn_x'|'sp_x', params)`) → `DatabaseService` (the sole `pg` boundary) → the stored procedure. No controller or service ever imports `DatabaseService` directly.

The `auth` module has no `repository.ts` — Better Auth owns its own tables (`user`/`session`/`account`/`verification`) and query layer internally; `accounts` module's repository is what calls the `accounts/` procedures operating on Better Auth's `user` table additional fields.

---

## 4. Module-by-module build plan (phased milestones)

### M0 — Repo foundation

- `docker-compose.yml` for local Postgres
- `packages/types` workspace package (mirrors the conventions in `packages/ui`, `packages/eslint-config`)
- `@nestjs/config` env loading in `apps/api`
- Migration tool wired up + initial migration from §2 (tables) plus a migration step that applies every `.sql` file under `apps/api/src/database/procedures/<domain>/`
- `database.module.ts` + `database.service.ts` (§3): wraps the `pg` `Pool`, exposes one method used only to invoke `fn_*`/`sp_*` procedures — the sole raw-SQL boundary in the app
- `common/` module in `apps/api`: global exception filter, response interceptor

### M1 — Auth & Approval

- Better Auth mounted inside `apps/api` (email/password + Bearer plugin), plus an `accounts` module for the domain-specific pieces Better Auth doesn't know about
- Signup via Better Auth's `signUp.email`, with a database hook defaulting new users to `pending`
- Login via Better Auth's `signIn.email`, issuing a Bearer session token (no hand-rolled JWT)
- Admin-only approve/reject/suspend endpoints driving the `pending → approved / rejected / suspended` state machine, operating on Better Auth's `user` table additional fields
- `RolesGuard` (poster/taker/admin) + `StatusGuard` (must be `approved` to post/claim), both reading from the Better Auth session instead of decoding a JWT
- Frontend: signup + login pages in `apps/client` (via Better Auth's client SDK); pending-accounts review screen in `apps/admin`

### M2 — Listings

- `listings` module: `create()`/`browse()` service functions are thin wrappers calling `sp_create_listing`/`sp_browse_listings` (approved posters only for create; Haversine distance sort + expiry sort done inside `sp_browse_listings`)
- Address exposure rule: `address_approx` always returned, `address_exact` withheld until a claim exists (enforced in M3)
- Frontend: "new listing" form + browse feed in `apps/client`

### M3 — Claims + Contact reveal

- `claims` module: `claim()` service function calls `sp_claim_listing`, which does the `SELECT ... FOR UPDATE` + insert claim + update listing status atomically inside one `plpgsql` function body (backed by the partial unique index) so two simultaneous claims on one listing can't both succeed
- Pickup countdown (`pickup_deadline`) set on claim
- `@nestjs/schedule` cron jobs call `sp_expire_listings()` / `sp_release_stale_claims()` on a schedule — no logic duplicated in TypeScript
- Contact reveal is a **serialization rule**, not a separate module: listing/claim responses include the poster's `phone` + `address_exact` only when the requesting taker has an `active` claim on that listing
- Frontend: claim button + live countdown + revealed contact card in `apps/client`

### M4 — Completion & Stats

- Mark-completed endpoint: `complete()` service function calls `sp_complete_claim`, which updates claim + listing + reputation in one transaction, callable by either poster or taker on an active claim
- `stats` module: `overview()` service function calls `sp_stats_overview()` for total kg/servings rescued, per-donor totals, monthly trend, waste hotspots (expired-unclaimed listings grouped by area)
- Frontend: "mark completed" action in `apps/client`; stats surfaced in `apps/admin`

### M5 — Reputation

- `sp_recompute_reputation` called from `sp_complete_claim` on completion, and from `sp_release_stale_claims` on no-show
- Exposed on user profile API responses

### M6 — Admin dashboard & disputes

- `apps/admin` pages: pending accounts queue, suspend/reactivate action, platform dashboards (total kg rescued, top donors, monthly trend, hotspots) built on M4/M5 queries

### M7 — Hardening & tests

- Unit tests per service (auth, listings, claims, reputation)
- One e2e test specifically for the double-claim race condition
- Seed script for demo data

**Future scope (not planned in depth here, mirrors concept.md §9):** push/SMS/email notifications, NGO priority claim window, food-safety tagging, masked/proxy contact numbers, waste-hotspot heatmap UI.

---

## 5. API surface summary

| Method | Path                             | Role              | Purpose                                                      |
| ------ | -------------------------------- | ----------------- | ------------------------------------------------------------ |
| POST   | `/api/auth/sign-up/email`        | public            | Better Auth's built-in signup → our hook sets `pending`      |
| POST   | `/api/auth/sign-in/email`        | public            | Better Auth's built-in login → issues a Bearer session token |
| POST   | `/api/auth/sign-out`             | authenticated     | Better Auth's built-in session revocation                    |
| GET    | `/admin/accounts?status=pending` | admin             | List accounts awaiting review                                |
| PATCH  | `/admin/accounts/:id/approve`    | admin             | Approve account                                              |
| PATCH  | `/admin/accounts/:id/reject`     | admin             | Reject account (with reason)                                 |
| PATCH  | `/admin/accounts/:id/suspend`    | admin             | Suspend an approved account                                  |
| POST   | `/listings`                      | poster (approved) | Create a listing                                             |
| GET    | `/listings`                      | taker (approved)  | Browse, sorted by distance/expiry                            |
| GET    | `/listings/:id`                  | taker (approved)  | View one listing (exact address hidden unless claimed)       |
| POST   | `/listings/:id/claim`            | taker (approved)  | Claim a listing (locks it)                                   |
| PATCH  | `/claims/:id/complete`           | poster or taker   | Mark pickup completed                                        |
| GET    | `/stats/overview`                | admin             | Total kg rescued, top donors, trends, hotspots               |

---

## 6. Frontend architecture

Both `apps/client/src/` and `apps/admin/src/` follow this same structure independently — no cross-app frontend package; shared UI primitives still come from `packages/ui` per the existing repo convention. The App Router (`app/`) stays thin (routes only); all data-fetching, mutations, and forms live in `features/<domain>/`.

Reference structure (identical shape for both apps):

```
src/
├── app/                                # next.js app router (routes only, thin)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── posts/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── providers.tsx                  # react query provider lives here
│
├── features/                          # one folder per domain/feature
│   ├── auth/
│   │   ├── api/
│   │   │   └── auth.api.ts            # raw fetch/axios calls
│   │   ├── hooks/
│   │   │   ├── use-login.ts
│   │   │   ├── use-register.ts
│   │   │   └── use-current-user.ts
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── schema/
│   │   │   └── auth.schema.ts         # zod schemas
│   │   └── types.ts
│   │
│   └── posts/
│       ├── api/
│       │   └── posts.api.ts
│       ├── hooks/
│       │   ├── use-posts.ts           # list (useQuery)
│       │   ├── use-post.ts            # detail (useQuery)
│       │   ├── use-create-post.ts     # useMutation
│       │   ├── use-update-post.ts     # useMutation
│       │   └── use-delete-post.ts     # useMutation
│       ├── components/
│       │   ├── post-list.tsx
│       │   ├── post-card.tsx
│       │   └── post-form.tsx
│       └── types.ts
│
├── components/
│   ├── ui/                            # shadcn generated components
│   └── shared/                        # cross-feature shared components
│
├── hooks/                             # generic hooks, not feature-specific
│   ├── use-debounce.ts
│   └── use-media-query.ts
│
├── lib/
│   ├── api-client.ts                  # fetch wrapper (base url, auth headers, error handling)
│   ├── query-client.ts                # QueryClient instance + default options
│   ├── query-keys.ts                  # centralized query key factory
│   ├── auth.ts                        # betterauth config
│   └── utils.ts
│
└── types/
    └── global.d.ts
```

**Mapped onto FoodBridge's domains** (mirrors the backend modules in §3/§4/§5):

- `apps/client/src/features/`: `auth/`, `listings/` (create + browse, mirrors the sample `posts/` feature 1:1), `claims/` (claim action, countdown, revealed contact card)
- `apps/admin/src/features/`: `auth/`, `accounts/` (pending queue, approve/reject/suspend), `stats/` (dashboards), `disputes/`
- Route groups follow the page map in §7: `(auth)/login`, `(auth)/signup` for both apps; `(dashboard)/listings`, `(dashboard)/listings/new`, `(dashboard)/listings/[id]`, `(dashboard)/my-listings`, `(dashboard)/my-claims` for `client`; `(dashboard)/accounts`, `(dashboard)/accounts/[id]`, `(dashboard)/stats`, `(dashboard)/disputes` for `admin`

**`lib/` layer, per app:**

- `api-client.ts` — thin fetch/axios wrapper: base URL from env, attaches the Better Auth Bearer token (per §1's Bearer-plugin decision), central error handling raising typed errors consumed by TanStack Query
- `query-client.ts` + `app/providers.tsx` — one `QueryClient` per app, mounted in `providers.tsx`, default `staleTime`/`retry` options set once here
- `query-keys.ts` — centralized query-key factory per feature (e.g. `listingKeys.all`, `listingKeys.detail(id)`) so hooks and mutation invalidation stay consistent
- `auth.ts` — Better Auth **client** config (`createAuthClient` pointed at `apps/api`'s Better Auth mount + Bearer plugin), consumed by `features/auth/hooks/use-login.ts`, `use-current-user.ts`, etc.

`features/<name>/schema/*.schema.ts` holds Zod schemas for form validation, shared between the form component and its mutation hook's input type.

---

## 7. Frontend page map

**`apps/client`:** `/signup`, `/login`, `/listings` (browse), `/listings/new`, `/listings/[id]`, `/my-listings`, `/my-claims`

**`apps/admin`:** `/login`, `/accounts` (pending queue), `/accounts/[id]`, `/stats`, `/disputes`

---

## 8. Verification approach

- `bun turbo build`, `turbo check-types`, `turbo lint` must stay green after every milestone
- Manual smoke test per milestone, e.g. M3: open two browser sessions as different takers and race to claim the same listing — only one should succeed and the other should get a clear "already claimed" error
- The one piece of logic worth an automated e2e test from day one: the double-claim race condition (M7)

---

## Files this plan touches for consistency

- `plan/concept.md` — keep terminology identical (`pending/approved/rejected/suspended`, `available/claimed/completed/expired`, `active/completed/no_show`)
- `apps/api/src/app.module.ts`, `apps/api/package.json` — NestJS baseline new modules attach to
- `apps/api/src/database/procedures/<domain>/*.sql` — one stored procedure/function per domain operation (§2), grouped by domain folder; every `<name>.repository.ts` maps 1:1 to a subset of these (§3)
- `apps/api/src/modules/{listings,claims,accounts,stats,auth}/` — one module per domain, each following the controller → service → repository layering in §3
- `apps/client/src/{app,features,components,hooks,lib,types}`, `apps/admin/src/{app,features,components,hooks,lib,types}` — frontend baseline structure (§5)
- `packages/ui/src/*`, `packages/eslint-config/*`, `packages/typescript-config/*` — existing shared-package conventions to mirror for `packages/types`
