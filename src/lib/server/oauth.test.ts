import { describe, expect, it } from 'vitest';
import { selectVerifiedGitHubEmail } from './oauth';

describe('selectVerifiedGitHubEmail', () => {
	it('prefers verified public profile email', () => {
		expect(
			selectVerifiedGitHubEmail('me@example.com', [
				{ email: 'me@example.com', primary: false, verified: true, visibility: 'public' }
			])
		).toBe('me@example.com');
	});

	it('falls back to verified primary email', () => {
		expect(
			selectVerifiedGitHubEmail(null, [
				{ email: 'old@example.com', primary: false, verified: true, visibility: null },
				{ email: 'primary@example.com', primary: true, verified: true, visibility: null }
			])
		).toBe('primary@example.com');
	});

	it('rejects unverified emails', () => {
		expect(
			selectVerifiedGitHubEmail('me@example.com', [
				{ email: 'me@example.com', primary: true, verified: false, visibility: 'public' }
			])
		).toBeNull();
	});
});
