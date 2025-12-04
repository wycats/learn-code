import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
// import { generateSessionToken } from '$lib/server/auth';

export const POST: RequestHandler = async () => {
	const code = crypto.randomUUID();
	// Create a session token that will be assigned to this device later
	// const sessionToken = generateSessionToken();

	// We don't create the session record yet, just the auth request
	// Actually, we need to store the session token somewhere to give it to the child later.
	// Or we can just store the code, and when authorized, we generate the session then.

	await db.insert(table.deviceAuth).values({
		id: code,
		status: 'pending',
		expiresAt: new Date(Date.now() + 1000 * 60 * 10) // 10 minutes
	});

	return json({ code });
};
