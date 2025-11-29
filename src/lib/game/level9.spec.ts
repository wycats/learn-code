import { describe, it, expect } from 'vitest';
import { LEVEL_9 } from './levels';

describe('Level 9 Configuration', () => {
	it('should be defined', () => {
		expect(LEVEL_9).toBeDefined();
	});

	it('should have correct ID and name', () => {
		expect(LEVEL_9.id).toBe('level-9');
		expect(LEVEL_9.name).toBe('The Gauntlet');
	});

	it('should have custom tiles defined', () => {
		expect(LEVEL_9.customTiles).toBeDefined();
		expect(LEVEL_9.customTiles?.lava).toBeDefined();
		expect(LEVEL_9.customTiles?.ice).toBeDefined();
		expect(LEVEL_9.customTiles?.stone).toBeDefined();
	});

	it('should have correct tile types', () => {
		expect(LEVEL_9.customTiles?.lava.type).toBe('hazard');
		expect(LEVEL_9.customTiles?.ice.type).toBe('ice');
		expect(LEVEL_9.customTiles?.stone.type).toBe('wall');
	});

	it('should have layout using custom tiles', () => {
		const layoutValues = Object.values(LEVEL_9.layout);
		expect(layoutValues).toContain('lava');
		expect(layoutValues).toContain('ice');
		expect(layoutValues).toContain('stone');
	});
});
