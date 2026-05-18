import {
	createGoogleOAuthClient,
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	enableSudo
} from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { GoogleUserInfoSchema, normalizeVerifiedEmail } from '$lib/server/oauth';
import { sanitizeRedirectPath } from '$lib/server/security';
import { getBaseUrl } from '$lib/server/oauth-config';
import { OAuth2RequestError } from 'arctic';

export const GET: RequestHandler = async (event) => {
	const { url, cookies, locals } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('google_oauth_state') ?? null;
	const codeVerifier = cookies.get('google_code_verifier') ?? null;
	const redirectTo = sanitizeRedirectPath(cookies.get('auth_redirect_to'));

	if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const google = createGoogleOAuthClient(getBaseUrl(url.origin));
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		});
		if (!response.ok) return new Response(null, { status: 502 });
		const googleUser = GoogleUserInfoSchema.parse(await response.json());
		if (!googleUser.email_verified) return new Response(null, { status: 403 });

		// Check for existing session (Sudo Mode)
		if (locals.user && locals.session) {
			if (locals.user.googleId === googleUser.sub) {
				await enableSudo(locals.session.id);
				cookies.delete('auth_redirect_to', { path: '/' });
				return redirect(302, redirectTo);
			}
		}

		const existingUser = await db.query.user.findFirst({
			where: eq(table.user.googleId, googleUser.sub)
		});

		const normalizedEmail = normalizeVerifiedEmail(googleUser.email);

		if (existingUser) {
			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, existingUser.id, null);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} else {
			// Check if user exists with the same email
			const existingEmailUser = await db.query.user.findFirst({
				where: eq(table.user.email, normalizedEmail)
			});

			if (existingEmailUser) {
				// Link Google account to existing user
				await db
					.update(table.user)
					.set({ googleId: googleUser.sub })
					.where(eq(table.user.id, existingEmailUser.id));

				const sessionToken = generateSessionToken();
				const session = await createSession(sessionToken, existingEmailUser.id, null);
				setSessionTokenCookie(event, sessionToken, session.expiresAt);
			} else {
				// Create new user
				const userId = crypto.randomUUID();
				await db.insert(table.user).values({
					id: userId,
					googleId: googleUser.sub,
					email: normalizedEmail,
					name: googleUser.name
				});
				const sessionToken = generateSessionToken();
				const session = await createSession(sessionToken, userId, null);
				setSessionTokenCookie(event, sessionToken, session.expiresAt);
			}
		}

		cookies.delete('auth_redirect_to', { path: '/' });
		return redirect(302, redirectTo);
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			console.error('Google OAuth callback failed', e.code, e.description);
		} else if (e instanceof Error) {
			console.error('Google OAuth callback failed', e.name, e.message);
		} else {
			console.error('Google OAuth callback failed', e);
		}
		return new Response(null, {
			status: 500
		});
	}
};
