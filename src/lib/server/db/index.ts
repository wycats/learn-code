import { drizzle as drizzleVercel } from 'drizzle-orm/vercel-postgres';
import type { VercelPgDatabase } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

type Database = NodePgDatabase<typeof schema> | VercelPgDatabase<typeof schema>;

let dbInstance: Database | undefined;

function createDb() {
	// Use POSTGRES_URL or DATABASE_URL
	const connectionString = env.POSTGRES_URL || env.DATABASE_URL;

	if (!connectionString) throw new Error('POSTGRES_URL or DATABASE_URL is not set');

	if (dev) {
		const pool = new pg.Pool({ connectionString });
		return drizzlePg(pool, { schema });
	}

	return drizzleVercel(sql, { schema });
}

export function getDb() {
	dbInstance ??= createDb();
	return dbInstance;
}

export const db = new Proxy({} as Database, {
	get(_target, property, receiver) {
		return Reflect.get(getDb(), property, receiver);
	}
});
