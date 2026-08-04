import { applyProcedures, dropProcedures } from './lib/apply-procedures.js';

/**
 * Claim/expiry procedures added in M3. `fn_list_my_claims` is deliberately
 * excluded — it arrives in the next migration.
 */
const PROCEDURES = [
  'sp_claim_listing',
  'sp_expire_listings',
  'sp_release_stale_claims',
];

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  applyProcedures(pgm, 'claims', PROCEDURES);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  dropProcedures(pgm, 'claims', PROCEDURES);
};
