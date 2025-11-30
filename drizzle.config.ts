import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) throw new Error('POSTGRES_URL or DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: connectionString },
	verbose: true,
	strict: true
});
