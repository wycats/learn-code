import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { approveHandshake, rejectHandshake } from '$lib/server/device-auth';

export const load: PageServerLoad = async (event) => {
	const code = event.url.searchParams.get('code');
	if (!code) return redirect(302, '/');

	// If not logged in, redirect to login
	if (!event.locals.user) {
		event.cookies.set('auth_redirect_to', `/auth/handshake?code=${code}`, {
			path: '/',
			secure: import.meta.env.PROD,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});
		return redirect(302, `/login`);
	}

	const authRequest = await db.query.deviceAuth.findFirst({
		where: eq(table.deviceAuth.id, code)
	});

	if (!authRequest || authRequest.status !== 'pending') {
		return { error: 'Invalid or expired code' };
	}

	return {
		code,
		user: event.locals.user
	};
};

export const actions: Actions = {
	authorize: async (event) => {
		if (!event.locals.user) return fail(401);
		const formData = await event.request.formData();
		const code = formData.get('code') as string;

		const result = await approveHandshake(code, event.locals.user.id);
		if (!result.success) {
			return fail(400, { error: result.error });
		}

		return { success: true };
	},
	reject: async (event) => {
		const formData = await event.request.formData();
		const code = formData.get('code') as string;

		await rejectHandshake(code);

		return { rejected: true };
	}
};
