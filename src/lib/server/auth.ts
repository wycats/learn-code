import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { Google, GitHub } from 'arctic';
import { env } from '$env/dynamic/private';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

// TODO: Make this configurable for production
const BASE_URL = env.BASE_URL || 'http://localhost:5173';

export const google = new Google(
	env.GOOGLE_CLIENT_ID ?? '',
	env.GOOGLE_CLIENT_SECRET ?? '',
	`${BASE_URL}/login/google/callback`
);

export const github = new GitHub(env.GITHUB_CLIENT_ID ?? '', env.GITHUB_CLIENT_SECRET ?? '', null);

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(
	token: string,
	userId: string,
	githubAccessToken?: string | null
) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
		sudoExpiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
		githubAccessToken: githubAccessToken ?? null
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function enableSudo(sessionId: string) {
	const sudoExpiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
	await db.update(table.session).set({ sudoExpiresAt }).where(eq(table.session.id, sessionId));
}

export function isSudo(session: table.Session) {
	return session.sudoExpiresAt !== null && session.sudoExpiresAt.getTime() > Date.now();
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: {
				id: table.user.id,
				email: table.user.email,
				name: table.user.name,
				githubId: table.user.githubId,
				googleId: table.user.googleId
			},
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

export const profileCookieName = 'auth-profile';

export function setActiveProfileCookie(event: RequestEvent, profileId: string) {
	event.cookies.set(profileCookieName, profileId, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 365, // 1 year
		sameSite: 'lax'
	});
}

export function deleteActiveProfileCookie(event: RequestEvent) {
	event.cookies.delete(profileCookieName, { path: '/' });
}
