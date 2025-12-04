import { approveHandshake } from '$lib/server/device-auth';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { code } = await request.json();
	if (!code) {
		throw error(400, 'Missing code');
	}

	const result = await approveHandshake(code, locals.user.id);
	if (!result.success) {
		return json({ success: false, error: result.error }, { status: 400 });
	}

	return json({ success: true });
};
