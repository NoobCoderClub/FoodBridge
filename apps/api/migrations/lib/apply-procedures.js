import { basename, dirname, join } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PROCEDURES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'src',
  'database',
  'procedures',
);

/**
 * Resolves the `.sql` files for one domain, optionally narrowed to specific
 * procedure names.
 *
 * Scoping to a single domain is what keeps migrations ordered correctly: a
 * `language sql` body is validated by Postgres at creation time, so a procedure
 * referencing `"user"` cannot be applied before the Better Auth migration that
 * creates that table. An apply-everything glob silently breaks the moment a
 * later milestone adds a procedure with an earlier dependency.
 *
 * @param {string} domain Subdirectory under `src/database/procedures/`.
 * @param {string[]} [only] Procedure names (no extension) to restrict to.
 * @returns {string[]} Absolute paths, sorted.
 */
function procedureFiles(domain, only) {
  const dir = join(PROCEDURES_DIR, domain);
  const files = readdirSync(dir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (!only) return files.map((file) => join(dir, file));

  return only.map((name) => {
    const file = `${name}.sql`;
    if (!files.includes(file)) {
      throw new Error(`No such procedure: ${domain}/${file}`);
    }
    return join(dir, file);
  });
}

/**
 * Applies a domain's stored procedures. Every `.sql` file uses
 * `CREATE OR REPLACE`, so this is idempotent and safe to re-run from a later
 * migration when a body changes.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 * @param {string} domain
 * @param {string[]} [only]
 */
export function applyProcedures(pgm, domain, only) {
  for (const file of procedureFiles(domain, only)) {
    pgm.sql(readFileSync(file, 'utf8'));
  }
}

/**
 * Drops a domain's stored procedures. Each `.sql` file is named after the
 * routine it defines, and none are overloaded, so the argument list can be
 * omitted from `DROP FUNCTION`.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 * @param {string} domain
 * @param {string[]} [only]
 */
export function dropProcedures(pgm, domain, only) {
  for (const file of procedureFiles(domain, only)) {
    pgm.sql(`DROP FUNCTION IF EXISTS ${basename(file, '.sql')};`);
  }
}
