import {
	createGitHubOAuthClient,
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
import { encryptToken } from '$lib/server/crypto';
import { GitHubEmailSchema, GitHubUserSchema, selectVerifiedGitHubEmail } from '$lib/server/oauth';
import { sanitizeRedirectPath } from '$lib/server/security';
import { getBaseUrl } from '$lib/server/oauth-config';

export const GET: RequestHandler = async (event) => {
	const { url, cookies, locals } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('github_oauth_state') ?? null;
	const redirectTo = sanitizeRedirectPath(cookies.get('auth_redirect_to'));

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const github = createGitHubOAuthClient(getBaseUrl(url.origin));
		const tokens = await github.validateAuthorizationCode(code);
		const accessToken = tokens.accessToken();
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		if (!githubUserResponse.ok) return new Response(null, { status: 502 });
		const githubUser = GitHubUserSchema.parse(await githubUserResponse.json());

		// Encrypt the access token if it exists
		const encryptedAccessToken = accessToken ? encryptToken(accessToken) : null;

		// Check for existing session (Sudo Mode & Scope Upgrade)
		if (locals.user && locals.session) {
			if (locals.user.githubId === String(githubUser.id)) {
				await enableSudo(locals.session.id);

				// Update the session with the new token (which might have more scopes)
				if (encryptedAccessToken) {
					await db
						.update(table.session)
						.set({ githubAccessToken: encryptedAccessToken })
						.where(eq(table.session.id, locals.session.id));
				}

				cookies.delete('auth_redirect_to', { path: '/' });
				return redirect(302, redirectTo);
			}
		}

		// Fetch email if not public
		const emailsResponse = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		if (!emailsResponse.ok) return new Response(null, { status: 502 });
		const emails = GitHubEmailSchema.array().parse(await emailsResponse.json());
		const normalizedEmail = selectVerifiedGitHubEmail(githubUser.email, emails);
		if (!normalizedEmail) return new Response(null, { status: 403 });

		const existingUser = await db.query.user.findFirst({
			where: eq(table.user.githubId, String(githubUser.id))
		});

		if (existingUser) {
			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, existingUser.id, encryptedAccessToken);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} else {
			// Check if user exists with the same email
			const existingEmailUser = await db.query.user.findFirst({
				where: eq(table.user.email, normalizedEmail)
			});

			if (existingEmailUser) {
				// Link GitHub account to existing user
				await db
					.update(table.user)
					.set({ githubId: String(githubUser.id) })
					.where(eq(table.user.id, existingEmailUser.id));

				const sessionToken = generateSessionToken();
				const session = await createSession(
					sessionToken,
					existingEmailUser.id,
					encryptedAccessToken
				);
				setSessionTokenCookie(event, sessionToken, session.expiresAt);
			} else {
				// Create new user
				const userId = crypto.randomUUID();
				await db.insert(table.user).values({
					id: userId,
					githubId: String(githubUser.id),
					email: normalizedEmail,
					name: githubUser.name || githubUser.login
				});
				const sessionToken = generateSessionToken();
				const session = await createSession(sessionToken, userId, encryptedAccessToken);
				setSessionTokenCookie(event, sessionToken, session.expiresAt);
			}
		}

		cookies.delete('auth_redirect_to', { path: '/' });
		return redirect(302, redirectTo);
	} catch (e) {
		console.error(e);
		return new Response(null, {
			status: 500
		});
	}
};
