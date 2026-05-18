import { generateState } from 'arctic';
import { createGitHubOAuthClient } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sanitizeRedirectPath } from '$lib/server/security';
import { getBaseUrl, getOAuthProviderConfigStatus } from '$lib/server/oauth-config';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const config = getOAuthProviderConfigStatus('github');
	if (!config.configured) {
		return new Response(
			`GitHub login is not configured. Missing: ${config.missing.join(', ')}. See .env.example.`,
			{ status: 503 }
		);
	}

	const state = generateState();
	const github = createGitHubOAuthClient(getBaseUrl(url.origin));
	const authorizationUrl = await github.createAuthorizationURL(state, ['user:email']);

	cookies.set('github_oauth_state', state, {
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
