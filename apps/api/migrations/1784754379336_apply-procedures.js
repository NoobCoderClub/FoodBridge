import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROCEDURES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'database',
  'procedures',
);

function listProcedureFiles() {
  const files = [];
  for (const domain of readdirSync(PROCEDURES_DIR, { withFileTypes: true })) {
    if (!domain.isDirectory()) continue;
    const domainDir = join(PROCEDURES_DIR, domain.name);
    for (const file of readdirSync(domainDir)) {
      if (file.endsWith('.sql')) files.push(join(domainDir, file));
    }
  }
  return files.sort();
}

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Applies every hand-written stored procedure/function under
 * `src/database/procedures/<domain>/*.sql`. This is the one procedure-apply
 * mechanism for the whole app — every later milestone's new `.sql` files are
 * picked up here automatically; do not add a second mechanism.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  for (const file of listProcedureFiles()) {
    pgm.sql(readFileSync(file, 'utf8'));
  }
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = () => {};
