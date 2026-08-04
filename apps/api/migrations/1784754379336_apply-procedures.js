/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * M0 created the `src/database/procedures/<domain>/` directories but no
 * procedures yet — the first ones arrive with the accounts module in M1. This
 * migration is therefore intentionally empty.
 *
 * It previously globbed *every* `.sql` file under `procedures/`, which meant it
 * retroactively picked up later milestones' files and tried to create
 * `fn_list_accounts` — a `language sql` body selecting from `"user"`, validated
 * by Postgres at creation time — two migrations before Better Auth creates that
 * table. That broke `migrate:up` on any fresh database. Each milestone's
 * procedures are now applied by its own migration, scoped to a single domain;
 * see `migrations/lib/apply-procedures.js`.
 *
 * @returns {Promise<void> | void}
 */
export const up = () => {};

/**
 * @returns {Promise<void> | void}
 */
export const down = () => {};
