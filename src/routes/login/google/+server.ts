import { generateState, generateCodeVerifier } from 'arctic';
import { createGoogleOAuthClient } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sanitizeRedirectPath } from '$lib/server/security';
import { getBaseUrl, getOAuthProviderConfigStatus } from '$lib/server/oauth-config';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const config = getOAuthProviderConfigStatus('google');
	if (!config.configured) {
		return new Response(
			`Google login is not configured. Missing: ${config.missing.join(', ')}. See .env.example.`,
			{ status: 503 }
		);
	}

	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const google = createGoogleOAuthClient(getBaseUrl(url.origin));
	const authorizationUrl = await google.createAuthorizationURL(state, codeVerifier, [
		'profile',
		'email'
	]);

	cookies.set('google_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	cookies.set('auth_redirect_to', sanitizeRedirectPath(url.searchParams.get('redirectTo')), {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	redirect(302, authorizationUrl.toString());
};
