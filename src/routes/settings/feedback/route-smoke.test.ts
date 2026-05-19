import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn()
	}
}));

describe('/settings/feedback route module', () => {
	it('only exposes SvelteKit-approved public exports', async () => {
		const mod = await import('./+page.server');
		expect(Object.keys(mod).sort()).toEqual(['load']);
	});
});
