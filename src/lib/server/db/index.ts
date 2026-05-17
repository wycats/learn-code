import { drizzle as drizzleVercel } from 'drizzle-orm/vercel-postgres';
import type { VercelPgDatabase } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

type Database =
	| NodePgDatabase<typeof schema>
	| VercelPgDatabase<typeof schema>
	| PgliteDatabase<typeof schema>;

const connectionString = env.POSTGRES_URL || env.DATABASE_URL;

let dbInstance: Database;

if ((dev && !connectionString) || connectionString?.startsWith('pglite:')) {
	const dataDir = connectionString?.replace(/^pglite:/, '') || './.pglite';
	const client = new PGlite(dataDir);
	const db = drizzlePglite(client, { schema });
	await migratePglite(db, { migrationsFolder: './drizzle' });
	dbInstance = db;
} else if (dev) {
	const pool = new pg.Pool({ connectionString });
	dbInstance = drizzlePg(pool, { schema });
} else if (connectionString) {
	dbInstance = drizzleVercel(sql, { schema });
} else {
	dbInstance = new Proxy({} as Database, {
		get() {
			throw new Error('POSTGRES_URL or DATABASE_URL is not set');
		}
	});
}

export const db = dbInstance;
