import { describe, it, expect } from 'vitest';
import { LEVEL_1 } from './levels';

describe('Level 1', () => {
	it('should parse correctly', () => {
		expect(LEVEL_1).toBeDefined();
		expect(LEVEL_1.intro).toHaveLength(3);
		expect(LEVEL_1.hints).toHaveLength(2);
		expect(LEVEL_1.intro![1].speaker).toBe('Guide');
	});
});
