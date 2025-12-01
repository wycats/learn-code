import { describe, it, expect } from 'vitest';
import { PACKS } from './index';

describe('Pack Validation', () => {
	it('should validate all packs', () => {
		expect(PACKS.length).toBeGreaterThan(0);
		PACKS.forEach((pack) => {
			expect(pack).toBeDefined();
			expect(pack.id).toBeDefined();
		});
	});
});
