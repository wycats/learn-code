import { describe, expect, it } from 'vitest';
import {
	getOAuthCallbackUrls,
	getOAuthConfigStatus,
	getOAuthProviderConfigStatus,
	getRuntimeConfiguredOAuthProviders
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
		expect(
			getOAuthConfigStatus({ BASE_URL: 'https://example.test' }, 'https://example.test').baseUrl
		).toBe('https://example.test');
	});

	it('normalizes trailing slashes in the base URL', () => {
		expect(
			getOAuthConfigStatus({ BASE_URL: 'https://example.test/' }, 'https://example.test').baseUrl
		).toBe('https://example.test');
		expect(getOAuthCallbackUrls('https://example.test/')).toEqual({
			google: 'https://example.test/login/google/callback',
			github: 'https://example.test/login/github/callback'
		});
	});

	it('marks configured callback origins that do not match the request origin', () => {
		expect(
			getOAuthConfigStatus(
				{ BASE_URL: 'https://kibi.wycats.dev' },
				'https://learn-code-git-feature.vercel.app'
			).callbackOriginMatchesRequest
		).toBe(false);
	});

	it('includes provider callback URLs', () => {
		expect(getOAuthCallbackUrls('https://example.test')).toEqual({
			google: 'https://example.test/login/google/callback',
			github: 'https://example.test/login/github/callback'
		});
	});
});

describe('getRuntimeConfiguredOAuthProviders', () => {
	it('reports only providers with complete runtime config', () => {
		expect(
			getRuntimeConfiguredOAuthProviders({
				GOOGLE_CLIENT_ID: 'google-client',
				GOOGLE_CLIENT_SECRET: 'google-secret',
				GITHUB_CLIENT_ID: 'github-client'
			})
		).toEqual({
			google: true,
			github: false
		});
	});

	it('disables providers when the configured callback origin differs from the request origin', () => {
		expect(
			getRuntimeConfiguredOAuthProviders(
				{
					BASE_URL: 'https://kibi.wycats.dev',
					GITHUB_CLIENT_ID: 'github-client',
					GITHUB_CLIENT_SECRET: 'github-secret',
					AUTH_TOKEN_SECRET: 'token-secret'
				},
				'https://learn-code-git-feature.vercel.app'
			)
		).toEqual({
			google: false,
			github: false
		});
	});
});
