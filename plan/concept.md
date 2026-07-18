# FoodBridge — Full Concept Guide

A Community Food Rescue Platform for Surplus Redistribution

---

## 1. Problem Statement

Restaurants, cafes, caterers, and event organizers regularly end up with surplus food that goes to waste, while NGOs and individuals nearby could use it. There's no simple bridge connecting the two in real time. FoodBridge solves this by letting food posters list surplus food instantly, and approved food takers claim and pick it up before it expires.

---

## 2. Actors in the System

| Role | Who they are | What they do |
|---|---|---|
| **Food Poster** | Restaurants, cafes, caterers, event organizers, households with excess food | Create food listings when they have surplus |
| **Food Taker** | NGOs, shelters, individuals nearby | Browse and claim available listings |
| **Admin** | Platform moderator | Approves/rejects poster & taker accounts, handles disputes, monitors platform health |

---

## 3. Registration & Approval Flow

Approval happens **once, at account level** — not per listing or per claim.

1. **Signup** — Poster or taker registers with basic details. Posters may submit business/restaurant info; NGOs may submit registration proof.
2. **Pending state** — New accounts sit as `pending` and cannot post or claim anything yet.
3. **Admin review** — Admin verifies legitimacy (business details, NGO registration, contact info) and approves or rejects.
4. **Approved** — Poster can now create listings freely; taker can browse/claim freely. No admin involvement per post or per claim after this.
5. **Rejected / Suspended** — Rejected signups are notified with a reason. Admin can suspend an already-approved account later for repeated no-shows or fraud reports.

**Account states:** `pending` → `approved` → (`suspended` / `rejected`)

---

## 4. End-to-End Flow

1. Poster/taker signs up → status: `pending`
2. Admin reviews and approves → status: `approved`
3. Approved poster creates a food listing:
   - Food type
   - Quantity (kg or servings)
   - Pickup location
   - Prepared time
   - Expiry / safe-to-consume window
4. Listing goes live, visible only to approved takers — sorted by distance and time-to-expiry
5. Approved taker claims the listing:
   - Listing locks (no double-claiming)
   - Pickup countdown timer starts
   - **Poster's phone number and exact pickup address become visible to that taker**
6. Pickup happens within the countdown window
7. Either side marks the pickup as **completed** → triggers "kg of food saved" stat
8. If nobody claims in time → listing auto-expires → flagged as wasted (valuable data: shows where/when waste is highest)
9. If taker claims but doesn't show up → claim auto-releases → listing reopens for others

---

## 5. Contact Between Poster and Taker

**Chosen approach: Claim-unlocks-contact**

- Before a claim: taker sees only an approximate/area-level location (poster privacy)
- After a claim: taker sees poster's **phone number** and the **exact pickup address**
- Coordination happens over a direct phone call — realistic for time-sensitive physical handoffs
- No in-app chat/messaging system needed — keeps scope focused on core SQL logic rather than real-time infra

*(Future scope idea: masked/proxy contact numbers like ride-sharing apps, for production-level privacy — worth a mention in the report's "Future Scope" section.)*

---

## 6. Reputation & Stats Layer

- **Donor trust score** — based on accurate quantities, honest expiry times, reliability
- **Taker reliability score** — based on show-up rate after claiming
- **Platform-wide dashboards:**
  - Total kg of food rescued
  - Top contributing donors
  - Monthly waste-reduction trends
  - Waste hotspots (listings that expired unclaimed)

---

## 7. Core Modules (for system design / report structure)

1. **Auth & Approval Module** — signup, roles (poster/taker/admin), account status (pending/approved/rejected/suspended)
2. **Listing Module** — create, view, filter listings by distance/expiry
3. **Claim Module** — claim locking, countdown timer, auto-release on no-show
4. **Contact Module** — reveal poster contact info + exact address upon claim
5. **Completion & Stats Module** — mark completed, kg-saved tracking, aggregation queries
6. **Reputation Module** — trust/reliability scores for posters and takers
7. **Admin Module** — approve/reject accounts, suspend accounts, view disputes/reports

---

## 8. Suggested Database Tables (high level)

- `users` — id, name, role (poster/taker/admin), status (pending/approved/rejected/suspended), phone, contact info
- `listings` — id, poster_id, food_type, quantity, pickup_location, prepared_at, expires_at, status (available/claimed/completed/expired)
- `claims` — id, listing_id, taker_id, claimed_at, pickup_deadline, status (active/completed/no_show)
- `reputation` — user_id, completed_count, no_show_count, score

---

## 9. Optional Extensions (Future Scope)

- Push/SMS/email notifications when a new listing appears near a taker
- NGO priority window — NGOs get first-claim rights for a few minutes before individuals can claim
- Food safety tagging (cooked/perishable vs packaged) auto-adjusting claim windows
- Masked contact numbers for privacy
- Heatmap of waste hotspots for city-level insights

---

## 10. Tech Stack & Monorepo Guide

**Monorepo tooling:** Turborepo
**Package manager:** Bun

### Repo layout

```
foodbridge/
├── apps/
│   ├── client/     # Next.js — donor & claimer facing app
│   ├── admin/      # Next.js — internal/admin dashboard
│   └── api/        # NestJS — backend API
├── packages/
│   ├── ui/                # shared shadcn/ui components (used by client + admin)
│   ├── eslint-config/     # shared lint rules
│   ├── typescript-config/ # shared tsconfig base
│   └── types/              # shared TS types/DTOs between api and frontends
├── turbo.json
├── package.json
└── bun.lockb
```

### Why this split

- **`apps/client`** — the public-facing Next.js app where donors post listings and claimers browse/claim. Uses React Query + Axios to talk to the API, Tailwind + shadcn/ui for UI.
- **`apps/admin`** — separate Next.js app for internal use (moderation, monitoring, platform stats). Kept separate from `client` so admin auth/permissions and UI don't mix with the public app, and so it can be deployed/scaled independently.
- **`apps/api`** — single NestJS backend serving both `client` and `admin`. Owns all business logic, auth, and raw SQL queries against PostgreSQL. Neither frontend touches the database directly.
- **`packages/*`** — shared code so `client` and `admin` don't duplicate UI components, types, or config. Type-safety between frontend and backend comes from a shared `types` package (e.g. shared DTO interfaces) rather than codegen.

### Turborepo responsibilities

- `turbo dev` — runs `client`, `admin`, and `api` in parallel with caching
- `turbo build` — builds all apps, respecting the dependency graph (`packages/*` build before `apps/*` that depend on them)
- `turbo lint` / `turbo type-check` — runs across every app/package, cached per-package so only changed packages re-run

### Why Bun

- Fast install times for a monorepo with multiple `apps/` and `packages/` workspaces
- Native workspace support (`bun install` at root resolves all workspaces)
- Fast dev script execution, which matters when Turborepo is spinning up 3 apps concurrently

### Suggested root `package.json` scripts

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check"
  },
  "packageManager": "bun@1.x"
}
```

### Data flow across apps

```
client (Next.js) ─┐
                   ├──► api (NestJS) ──► PostgreSQL (raw SQL)
admin  (Next.js) ─┘
```

Both frontends are pure consumers of the API — no direct DB access from either, keeping a single source of truth for business logic and query correctness.