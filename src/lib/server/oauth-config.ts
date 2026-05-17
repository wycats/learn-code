import { env } from '$env/dynamic/private';

export type OAuthProvider = 'google' | 'github';

export interface OAuthProviderConfigStatus {
	provider: OAuthProvider;
	configured: boolean;
	missing: string[];
}

const REQUIRED_ENV: Record<OAuthProvider, string[]> = {
	google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
	github: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'AUTH_TOKEN_SECRET']
};

export function getBaseUrl() {
	return env.BASE_URL || 'http://localhost:5173';
}

export function getOAuthCallbackUrls(baseUrl = getBaseUrl()) {
	return {
		google: `${baseUrl}/login/google/callback`,
		github: `${baseUrl}/login/github/callback`
	};
}

export function getOAuthProviderConfigStatus(
	provider: OAuthProvider,
	values: Record<string, string | undefined> = env
): OAuthProviderConfigStatus {
	const missing = REQUIRED_ENV[provider].filter((key) => !values[key]);
	return {
		provider,
		configured: missing.length === 0,
		missing
	};
}

export function getOAuthConfigStatus(values: Record<string, string | undefined> = env) {
	const baseUrl = values.BASE_URL || getBaseUrl();
	return {
		baseUrl,
		callbackUrls: getOAuthCallbackUrls(baseUrl),
		google: getOAuthProviderConfigStatus('google', values),
		github: getOAuthProviderConfigStatus('github', values)
	};
}
