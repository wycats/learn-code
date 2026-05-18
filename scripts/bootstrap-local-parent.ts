import * as table from '../src/lib/server/db/schema.ts';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { PGlite } from '@electric-sql/pglite';

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (databaseUrl && !databaseUrl.startsWith('pglite:')) {
	console.error('This script currently bootstraps local PGlite databases only.');
	process.exit(1);
}

const dataDir = databaseUrl?.replace(/^pglite:/, '') || './.pglite';
const client = new PGlite(dataDir);
const db = drizzle(client, { schema: table });
await migrate(db, { migrationsFolder: './drizzle' });

const email = process.env.KIBI_PARENT_EMAIL;
const name = process.env.KIBI_PARENT_NAME ?? 'Parent';

if (!email) {
	console.error('KIBI_PARENT_EMAIL is required.');
	process.exit(1);
}

const normalizedEmail = email.trim().toLowerCase();
const existingUser = await db.query.user.findFirst({
	where: eq(table.user.email, normalizedEmail)
});

let userId = existingUser?.id;
if (!existingUser) {
	userId = crypto.randomUUID();
	await db.insert(table.user).values({
		id: userId,
		email: normalizedEmail,
		name
	});
	console.log(`Created local parent account for ${normalizedEmail}.`);
} else {
	console.log(`Local parent account already exists for ${normalizedEmail}.`);
}

const profiles = await db.query.profile.findMany({
	where: eq(table.profile.userId, userId!)
});

for (const child of [
	{ nickname: 'Jonas', avatar: 'person', color: '#3b82f6' },
	{ nickname: 'Zoey', avatar: 'person', color: '#ef4444' }
]) {
	if (profiles.some((profile) => profile.nickname.toLowerCase() === child.nickname.toLowerCase())) {
		continue;
	}

	await db.insert(table.profile).values({
		id: crypto.randomUUID(),
		userId: userId!,
		...child
	});
	console.log(`Created ${child.nickname} profile.`);
}

await client.close();
