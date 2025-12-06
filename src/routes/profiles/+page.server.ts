import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { setActiveProfileCookie } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const profiles = await db.query.profile.findMany({
		where: eq(table.profile.userId, event.locals.user.id)
	});

	return {
		profiles,
		user: event.locals.user
	};
};

export const actions: Actions = {
	selectProfile: async (event) => {
		if (!event.locals.user) return fail(401);
		const formData = await event.request.formData();
		const profileId = formData.get('profileId') as string;

		// Verify ownership
		const profile = await db.query.profile.findFirst({
			where: eq(table.profile.id, profileId)
		});

		if (!profile || profile.userId !== event.locals.user.id) {
			return fail(403, { error: 'Invalid profile' });
		}

		setActiveProfileCookie(event, profileId);
		throw redirect(302, '/');
	},
	createProfile: async (event) => {
		if (!event.locals.user) return fail(401);
		const formData = await event.request.formData();
		const nickname = formData.get('nickname') as string;
		const avatar = formData.get('avatar') as string;
		const color = formData.get('color') as string;

		if (!nickname || !avatar || !color) {
			return fail(400, { error: 'Missing fields' });
		}

		const id = crypto.randomUUID();
		await db.insert(table.profile).values({
			id,
			userId: event.locals.user.id,
			nickname,
			avatar,
			color
		});

		setActiveProfileCookie(event, id);
		throw redirect(302, '/');
	}
};
