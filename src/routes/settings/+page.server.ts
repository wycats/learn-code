import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return {
			user: null,
			profiles: [],
			devices: []
		};
	}

	const profiles = await db.query.profile.findMany({
		where: eq(table.profile.userId, event.locals.user.id)
	});

	// Find authorized devices (deviceAuth entries)
	const devices = await db.query.deviceAuth.findMany({
		where: (deviceAuth, { and, eq }) =>
			and(eq(deviceAuth.userId, event.locals.user!.id), eq(deviceAuth.status, 'authorized')),
		orderBy: (deviceAuth, { desc }) => [desc(deviceAuth.createdAt)]
	});

	return {
		user: event.locals.user,
		profiles,
		devices
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);
		return redirect(302, '/login');
	},
	deleteProfile: async (event) => {
		if (!event.locals.user) return fail(401);
		const formData = await event.request.formData();
		const profileId = formData.get('profileId') as string;

		if (!profileId) return fail(400);

		await db.delete(table.profile).where(eq(table.profile.id, profileId));

		return { success: true };
	},
	revokeDevice: async (event) => {
		if (!event.locals.user) return fail(401);
		const formData = await event.request.formData();
		const deviceId = formData.get('deviceId') as string; // This is the deviceAuth ID

		if (!deviceId) return fail(400);

		// Get the device auth record to find the session
		const deviceAuth = await db.query.deviceAuth.findFirst({
			where: eq(table.deviceAuth.id, deviceId)
		});

		if (deviceAuth && deviceAuth.sessionId) {
			await invalidateSession(deviceAuth.sessionId);
		}

		// Also delete the deviceAuth record
		await db.delete(table.deviceAuth).where(eq(table.deviceAuth.id, deviceId));

		return { success: true };
	}
};
