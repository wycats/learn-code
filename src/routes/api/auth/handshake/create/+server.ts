import { createHandshakeCode } from '$lib/server/device-auth';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
	const id = await createHandshakeCode();
	return json({ id });
};
