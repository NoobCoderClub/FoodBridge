# FoodBridge — Implementation Plan

This document turns [`concept.md`](./concept.md) into an actionable, phased build order. `concept.md` is the "why/what" (product concept); this doc is the "how/in what order."

The repo currently is pure `create-turbo` scaffolding (default Next.js pages in `apps/client`/`apps/admin`, a bare NestJS `AppModule` in `apps/api`, no database, no auth, no business modules). Everything below is new work.

---

## 1. Foundational decisions

| Area | Decision | Why |
|---|---|---|
| DB access | Plain [`pg`](https://node-postgres.com/) driver, hand-written parameterized SQL — no ORM, no query builder | Matches concept.md's "raw SQL against PostgreSQL" intent literally; keeps query logic visible and reviewable |
| Auth | Stateless JWT (short-lived access token + refresh token) | NestJS API serves two separate Next.js origins (`client`, `admin`) — no shared session store needed; role/status carried in token claims |
| Geo/distance | Plain `latitude`/`longitude` columns + Haversine formula in SQL | Good enough for city-scale sorting; avoids a PostGIS dependency for MVP scope |
| Structure | Phased milestones (M0–M7), each independently buildable/demoable | Lets the project be built and tested incrementally instead of all-at-once |

**New dependencies introduced:**
- `apps/api`: `pg`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport` + `passport-jwt`, `bcrypt`, `@nestjs/schedule`, `class-validator` + `class-transformer`
- New workspace package `packages/types` — shared enums (`UserRole`, `AccountStatus`, `ListingStatus`, `ClaimStatus`) and DTO/entity interfaces (`User`, `Listing`, `Claim`, `Reputation`) consumed by `api`, `client`, and `admin`
- Root `docker-compose.yml` for local Postgres + `.env` / `.env.example` (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)

---

## 2. Database schema

Expands concept.md §8 into concrete DDL. Lives under `apps/api/src/database/migrations/`, run via a lightweight migration tool (e.g. `node-pg-migrate`) rather than a hand-rolled runner.

```sql
-- users
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
name                text NOT NULL
email               text UNIQUE NOT NULL
password_hash       text NOT NULL
phone               text
role                text NOT NULL CHECK (role IN ('poster','taker','admin'))
status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended'))
verification_info   jsonb            -- business details / NGO registration proof
created_at          timestamptz NOT NULL DEFAULT now()

-- listings
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
poster_id           uuid NOT NULL REFERENCES users(id)
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
taker_id            uuid NOT NULL REFERENCES users(id)
claimed_at          timestamptz NOT NULL DEFAULT now()
pickup_deadline     timestamptz NOT NULL
status              text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','no_show'))
completed_at        timestamptz

-- reputation
user_id             uuid PRIMARY KEY REFERENCES users(id)
completed_count     integer NOT NULL DEFAULT 0
no_show_count       integer NOT NULL DEFAULT 0
score               numeric NOT NULL DEFAULT 0
updated_at          timestamptz NOT NULL DEFAULT now()
```

**Indexes / constraints:**
- `listings(status, expires_at)` — fast lookup of live/expiring listings for browse + the auto-expire cron
- `listings(latitude, longitude)` — supports the Haversine distance sort
- Partial unique index `claims(listing_id) WHERE status = 'active'` — enforces "no double-claim" at the DB level, not just app logic

---

## 3. Module-by-module build plan (phased milestones)

### M0 — Repo foundation
- `docker-compose.yml` for local Postgres
- `packages/types` workspace package (mirrors the conventions in `packages/ui`, `packages/eslint-config`)
- `@nestjs/config` env loading in `apps/api`
- Migration tool wired up + initial migration from §2
- `common/` module in `apps/api`: global exception filter, response interceptor

### M1 — Auth & Approval
- `auth` + `users` modules in `apps/api`
- Signup (poster/taker) with `bcrypt` password hashing, starts in `pending`
- Login issuing JWT access + refresh tokens
- Admin-only approve/reject/suspend endpoints driving the `pending → approved / rejected / suspended` state machine
- `RolesGuard` (poster/taker/admin) + `StatusGuard` (must be `approved` to post/claim)
- Frontend: signup + login pages in `apps/client`; pending-accounts review screen in `apps/admin`

### M2 — Listings
- `listings` module: create (approved posters only), browse/list with Haversine distance sort + expiry sort
- Address exposure rule: `address_approx` always returned, `address_exact` withheld until a claim exists (enforced in M3)
- Frontend: "new listing" form + browse feed in `apps/client`

### M3 — Claims + Contact reveal
- `claims` module: claim endpoint runs inside a DB transaction (`SELECT ... FOR UPDATE` plus the partial unique index) so two simultaneous claims on one listing can't both succeed
- Pickup countdown (`pickup_deadline`) set on claim
- `@nestjs/schedule` cron jobs: auto-expire listings past `expires_at` with no claim; auto-release claims past `pickup_deadline` still `active` (listing reopens, claim → `no_show`)
- Contact reveal is a **serialization rule**, not a separate module: listing/claim responses include the poster's `phone` + `address_exact` only when the requesting taker has an `active` claim on that listing
- Frontend: claim button + live countdown + revealed contact card in `apps/client`

### M4 — Completion & Stats
- Mark-completed endpoint, callable by either poster or taker on an active claim
- Aggregation queries: total kg/servings rescued, per-donor totals, monthly trend, waste hotspots (expired-unclaimed listings grouped by area)
- Frontend: "mark completed" action in `apps/client`; stats surfaced in `apps/admin`

### M5 — Reputation
- Score recompute triggered on claim completion (taker reliability, poster trust) and on no-show
- Exposed on user profile API responses

### M6 — Admin dashboard & disputes
- `apps/admin` pages: pending accounts queue, suspend/reactivate action, platform dashboards (total kg rescued, top donors, monthly trend, hotspots) built on M4/M5 queries

### M7 — Hardening & tests
- Unit tests per service (auth, listings, claims, reputation)
- One e2e test specifically for the double-claim race condition
- Seed script for demo data

**Future scope (not planned in depth here, mirrors concept.md §9):** push/SMS/email notifications, NGO priority claim window, food-safety tagging, masked/proxy contact numbers, waste-hotspot heatmap UI.

---

## 4. API surface summary

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | public | Register poster/taker → `pending` |
| POST | `/auth/login` | public | Issue access + refresh JWT |
| POST | `/auth/refresh` | authenticated | Rotate access token |
| GET | `/admin/accounts?status=pending` | admin | List accounts awaiting review |
| PATCH | `/admin/accounts/:id/approve` | admin | Approve account |
| PATCH | `/admin/accounts/:id/reject` | admin | Reject account (with reason) |
| PATCH | `/admin/accounts/:id/suspend` | admin | Suspend an approved account |
| POST | `/listings` | poster (approved) | Create a listing |
| GET | `/listings` | taker (approved) | Browse, sorted by distance/expiry |
| GET | `/listings/:id` | taker (approved) | View one listing (exact address hidden unless claimed) |
| POST | `/listings/:id/claim` | taker (approved) | Claim a listing (locks it) |
| PATCH | `/claims/:id/complete` | poster or taker | Mark pickup completed |
| GET | `/stats/overview` | admin | Total kg rescued, top donors, trends, hotspots |

---

## 5. Frontend page map

**`apps/client`:** `/signup`, `/login`, `/listings` (browse), `/listings/new`, `/listings/[id]`, `/my-listings`, `/my-claims`

**`apps/admin`:** `/login`, `/accounts` (pending queue), `/accounts/[id]`, `/stats`, `/disputes`

---

## 6. Verification approach

- `bun turbo build`, `turbo check-types`, `turbo lint` must stay green after every milestone
- Manual smoke test per milestone, e.g. M3: open two browser sessions as different takers and race to claim the same listing — only one should succeed and the other should get a clear "already claimed" error
- The one piece of logic worth an automated e2e test from day one: the double-claim race condition (M7)

---

## Files this plan touches for consistency

- `plan/concept.md` — keep terminology identical (`pending/approved/rejected/suspended`, `available/claimed/completed/expired`, `active/completed/no_show`)
- `apps/api/src/app.module.ts`, `apps/api/package.json` — NestJS baseline new modules attach to
- `apps/client/app/`, `apps/admin/app/` — Next.js App Router baseline
- `packages/ui/src/*`, `packages/eslint-config/*`, `packages/typescript-config/*` — existing shared-package conventions to mirror for `packages/types`
