import { describe, expect, it } from 'vitest';
import {
	getOAuthCallbackUrls,
	getOAuthConfigStatus,
	getOAuthProviderConfigStatus
} from './oauth-config';

describe('getOAuthProviderConfigStatus', () => {
	it('reports missing Google configuration', () => {
		expect(getOAuthProviderConfigStatus('google', {})).toEqual({
			provider: 'google',
			configured: false,
			missing: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
		});
	});

	it('requires token encryption secret for GitHub because login stores access tokens', () => {
		expect(
			getOAuthProviderConfigStatus('github', {
				GITHUB_CLIENT_ID: 'client',
				GITHUB_CLIENT_SECRET: 'secret'
			}).missing
		).toEqual(['AUTH_TOKEN_SECRET']);
	});

	it('reports configured providers when all required values are present', () => {
		expect(
			getOAuthProviderConfigStatus('github', {
				GITHUB_CLIENT_ID: 'client',
				GITHUB_CLIENT_SECRET: 'secret',
				AUTH_TOKEN_SECRET: 'token-secret'
			}).configured
		).toBe(true);
	});
});

describe('getOAuthConfigStatus', () => {
	it('includes the base URL used for callback setup', () => {
		expect(getOAuthConfigStatus({ BASE_URL: 'https://example.test' }).baseUrl).toBe(
			'https://example.test'
		);
	});

	it('includes provider callback URLs', () => {
		expect(getOAuthCallbackUrls('https://example.test')).toEqual({
			google: 'https://example.test/login/google/callback',
			github: 'https://example.test/login/github/callback'
		});
	});
});
