import { drizzle as drizzleVercel } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const schemaSql = `
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"age" integer,
	"username" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id"),
	"expires_at" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
`;

// Use POSTGRES_URL or DATABASE_URL for a real Postgres server. In local development,
// default to PGlite so the app can run without Docker/OrbStack.
const connectionString = env.POSTGRES_URL || env.DATABASE_URL;

let dbInstance:
	| ReturnType<typeof drizzlePg>
	| ReturnType<typeof drizzleVercel>
	| ReturnType<typeof drizzlePglite>;

if (dev && (!connectionString || connectionString.startsWith('pglite:'))) {
	const dataDir = connectionString?.replace(/^pglite:/, '') || './.pglite';
	const client = new PGlite(dataDir);
	await client.exec(schemaSql);
	dbInstance = drizzlePglite(client, { schema });
} else if (dev) {
	const pool = new pg.Pool({ connectionString });
	dbInstance = drizzlePg(pool, { schema });
} else if (connectionString) {
	dbInstance = drizzleVercel(sql, { schema });
} else {
	dbInstance = new Proxy({} as NonNullable<typeof dbInstance>, {
		get() {
			throw new Error('POSTGRES_URL or DATABASE_URL is not set');
		}
	});
}

export const db = dbInstance;
