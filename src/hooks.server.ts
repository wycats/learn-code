import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth';
import * as table from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		event.locals.profile = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	// Handle Profile
	const profileId = event.cookies.get(auth.profileCookieName);
	if (profileId && user) {
		const profile = await db.query.profile.findFirst({
			where: eq(table.profile.id, profileId)
		});
		if (profile && profile.userId === user.id) {
			event.locals.profile = profile;
		} else {
			auth.deleteActiveProfileCookie(event);
			event.locals.profile = null;
		}
	} else {
		event.locals.profile = null;
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth);
