import { applyProcedures } from './lib/apply-procedures.js';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Re-applies the corrected `sp_recompute_reputation` body. The version
 * applied by 1785840320000_apply-reputation-procedures.js computed `score`
 * via a second UPDATE statement in the same WITH clause as the upsert CTE —
 * every statement inside one WITH runs against the same initial snapshot, so
 * for a user with no prior reputation row the UPDATE's scan of `reputation`
 * couldn't see the row its sibling CTE had just inserted, matched zero rows,
 * and silently left `score` at its placeholder 0. Fixed by computing `score`
 * directly inside a single INSERT ... ON CONFLICT statement instead.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  applyProcedures(pgm, 'reputation');
};

/**
 * Deliberately empty — replaces a function body, doesn't create a new
 * object; see 1785839210000_simplify-procedures.js for the same rationale.
 *
 * @returns {Promise<void> | void}
 */
export const down = () => {};
