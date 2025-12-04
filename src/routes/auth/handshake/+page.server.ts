import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const code = event.url.searchParams.get('code');
	if (!code) return redirect(302, '/');

	// If not logged in, redirect to login, but keep the handshake code in the redirect
	if (!event.locals.user) {
		return redirect(302, `/login?redirectTo=/auth/handshake?code=${code}`);
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

		await db
			.update(table.deviceAuth)
			.set({
				status: 'authorized',
				userId: event.locals.user.id
			})
			.where(eq(table.deviceAuth.id, code));

		return { success: true };
	},
	reject: async (event) => {
		const formData = await event.request.formData();
		const code = formData.get('code') as string;

		await db
			.update(table.deviceAuth)
			.set({ status: 'rejected' })
			.where(eq(table.deviceAuth.id, code));

		return { rejected: true };
	}
};
