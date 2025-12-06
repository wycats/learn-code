import { LevelPackSchema } from '../schema';
import { LEVEL_KEYS_1 } from '../levels';

export const VARIABLES_PACK = LevelPackSchema.parse({
	id: 'variables-pack',
	name: 'Keeper of Keys',
	description: 'Learn to use variables to store and use information.',
	difficulty: 'intermediate',
	tags: ['variables', 'loops'],
	version: '1.0.0',
	levels: [LEVEL_KEYS_1]
});
