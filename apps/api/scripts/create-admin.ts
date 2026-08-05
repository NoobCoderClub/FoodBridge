import 'dotenv/config';
import { Pool } from 'pg';
import { auth } from '../src/modules/auth/auth.config';

// Creates (or promotes an existing) admin account. There is no admin signup
// path in the app itself — the M1 design is that admins are seeded directly,
// never self-registered (auth.config.ts's create hook hard-coerces any
// signup-time role to 'poster'/'taker'). This script goes through Better
// Auth's own signUpEmail so the password is hashed exactly like a normal
// signup, then promotes the resulting row straight in the database, since
// there's no API route that would ever accept role: 'admin'.
async function main() {
  const [, , email, password, name] = process.argv;

  if (!email || !password || !name) {
    console.error('Usage: bun run create-admin <email> <password> "<name>"');
    process.exit(1);
  }
  if (!email.includes('@')) {
    console.error(
      `Error: Invalid email address "${email}". The first argument must be the email address.`,
    );
    console.error('Usage: bun run create-admin <email> <password> "<name>"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const existing = await pool.query<{ id: string }>(
      'select id from "user" where email = $1',
      [email],
    );

    let userId: string;
    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      console.log(`Found existing account for ${email}, promoting to admin.`);
    } else {
      const result = await auth.api.signUpEmail({
        body: { email, password, name },
      });
      userId = result.user.id;
      console.log(`Created account for ${email}.`);
    }

    await pool.query(
      `update "user" set role = 'admin', status = 'approved', "updatedAt" = now() where id = $1`,
      [userId],
    );

    console.log(`${email} is now an approved admin.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
