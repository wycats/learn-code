import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../src/lib/server/db/schema.ts';

const isVercelDeploy =
	process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
const isForced = process.argv.includes('--force');

if (!isVercelDeploy && !isForced) {
	console.log(
		'Not a Vercel production/preview build; skipping deploy migrations. Run `pnpm db:migrate:deploy` to migrate a configured Postgres database manually.'
	);
	process.exit(0);
}

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
	console.log('No POSTGRES_URL or DATABASE_URL found; skipping deploy migrations.');
	process.exit(0);
}

if (connectionString.startsWith('pglite:')) {
	console.log('PGlite database URL found; app startup handles local migrations.');
	process.exit(0);
}

const pool = new pg.Pool({ connectionString });
const db = drizzle(pool, { schema });

try {
	console.log('Running deploy database migrations...');
	await migrate(db, { migrationsFolder: './drizzle' });
	console.log('Deploy database migrations complete.');
} finally {
	await pool.end();
}
