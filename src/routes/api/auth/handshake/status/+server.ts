import { getHandshakeStatus } from '$lib/server/device-auth';
import { setSessionTokenCookie } from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');
	if (!code) return json({ status: 'error' }, { status: 400 });

	const result = await getHandshakeStatus(code);

	if (result.status === 'authorized' && result.token && result.expiresAt) {
		setSessionTokenCookie(event, result.token, result.expiresAt);
		return json({ status: 'authorized' });
	}

	return json({ status: result.status });
};
