import { drizzle as drizzleVercel } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

// Use POSTGRES_URL or DATABASE_URL
const connectionString = env.POSTGRES_URL || env.DATABASE_URL;

if (!connectionString) throw new Error('POSTGRES_URL or DATABASE_URL is not set');

let dbInstance;

if (dev) {
	const pool = new pg.Pool({ connectionString });
	dbInstance = drizzlePg(pool, { schema });
} else {
	dbInstance = drizzleVercel(sql, { schema });
}

export const db = dbInstance;
