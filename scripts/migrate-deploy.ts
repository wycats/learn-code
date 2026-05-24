import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../src/lib/server/db/schema.ts';

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
