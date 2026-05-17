import { describe, expect, it } from 'vitest';
import { safeSlug, sanitizeRedirectPath } from './security';

describe('sanitizeRedirectPath', () => {
	it('allows local absolute paths', () => {
		expect(sanitizeRedirectPath('/profiles')).toBe('/profiles');
		expect(sanitizeRedirectPath('/builder?pack=1')).toBe('/builder?pack=1');
	});

	it('rejects external or ambiguous redirects', () => {
		expect(sanitizeRedirectPath('https://example.com')).toBe('/');
		expect(sanitizeRedirectPath('//example.com')).toBe('/');
		expect(sanitizeRedirectPath('/\\example')).toBe('/');
		expect(sanitizeRedirectPath(null, '/fallback')).toBe('/fallback');
	});
});

describe('safeSlug', () => {
	it('creates bounded slugs with fallback', () => {
		expect(safeSlug('My Pack!', 'pack')).toBe('my-pack');
		expect(safeSlug('!!!', 'pack')).toBe('pack');
		expect(safeSlug('a'.repeat(100), 'pack')).toHaveLength(80);
	});
});
