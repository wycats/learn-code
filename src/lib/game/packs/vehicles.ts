import { LevelPackSchema } from '../schema';
import { LEVEL_BOAT_INTRO, LEVEL_BOAT_ISLAND, LEVEL_BOAT_1 } from '../levels';

export const VEHICLES_PACK = LevelPackSchema.parse({
	id: 'vehicles',
	name: 'The Lost Fleet',
	description: 'Master the art of sailing and explore the high seas.',
	coverImage: 'ship',
	difficulty: 'intermediate',
	tags: ['vehicles', 'exploration', 'water'],
	levels: [LEVEL_BOAT_INTRO, LEVEL_BOAT_ISLAND, LEVEL_BOAT_1]
});
