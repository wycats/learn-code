import { describe, it, expect } from 'vitest';
import { PACKS } from './index';
import { VEHICLES_PACK } from './vehicles';

describe('Pack Validation', () => {
	it('should validate all packs', () => {
		expect(PACKS.length).toBeGreaterThan(0);
		PACKS.forEach((pack) => {
			expect(pack).toBeDefined();
			expect(pack.id).toBeDefined();
		});
	});

	it('registers The Lost Fleet as a three-level boat pack', () => {
		expect(PACKS).toContain(VEHICLES_PACK);
		expect(VEHICLES_PACK.id).toBe('vehicles');
		expect(VEHICLES_PACK.name).toBe('The Lost Fleet');
		expect(VEHICLES_PACK.levels).toHaveLength(3);
		expect(VEHICLES_PACK.levels.map((level) => level.name)).toEqual([
			'Set Sail',
			'Island Hopping',
			'Row Your Boat'
		]);
	});

	it('keeps built-in level ids unique across registered packs', () => {
		const levelLocations = PACKS.flatMap((pack) =>
			pack.levels.map((level) => ({ packId: pack.id, levelId: level.id }))
		);
		const locationsById = new Map<string, string[]>();

		for (const { packId, levelId } of levelLocations) {
			const locations = locationsById.get(levelId) ?? [];
			locations.push(packId);
			locationsById.set(levelId, locations);
		}

		const duplicates = Array.from(locationsById.entries())
			.filter(([, locations]) => locations.length > 1)
			.map(([levelId, locations]) => ({ levelId, packs: locations }));

		expect(duplicates).toEqual([]);
	});
});
