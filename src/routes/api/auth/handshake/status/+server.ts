import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const code = url.searchParams.get('code');
	if (!code) return json({ status: 'error' }, { status: 400 });

	const authRequest = await db.query.deviceAuth.findFirst({
		where: eq(table.deviceAuth.id, code)
	});

	if (!authRequest) return json({ status: 'expired' });

	if (authRequest.status === 'authorized' && authRequest.userId) {
		// Create a real session now
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, authRequest.userId);

		// Set the cookie on this response (the child's polling request)
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		// Clean up
		await db.delete(table.deviceAuth).where(eq(table.deviceAuth.id, code));

		return json({ status: 'authorized' });
	}

	return json({ status: authRequest.status });
};
