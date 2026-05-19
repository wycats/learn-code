import { describe, expect, it } from 'vitest';

describe('/settings/feedback route module', () => {
	it('only exposes SvelteKit-approved public exports', async () => {
		const mod = await import('./+page.server');
		expect(Object.keys(mod).sort()).toEqual(['load']);
	});
});
