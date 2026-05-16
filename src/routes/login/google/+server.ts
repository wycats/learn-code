import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
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

	const redirectTo = url.searchParams.get('redirectTo');
	if (redirectTo) {
		cookies.set('auth_redirect_to', redirectTo, {
			path: '/',
			secure: import.meta.env.PROD,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});
	}

	redirect(302, authorizationUrl.toString());
};
