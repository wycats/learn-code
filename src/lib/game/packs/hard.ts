import { LevelPackSchema } from '../schema';
import { LEVEL_12, LEVEL_13, LEVEL_14 } from '../levels';

export const HARD_PACK = LevelPackSchema.parse({
	id: 'hard',
	name: 'The Void',
	description: 'Enter the glitch dimension. Physics are optional.',
	coverImage: 'skull',
	difficulty: 'expert',
	tags: ['void', 'glitch', 'expert'],
	levels: [LEVEL_12, LEVEL_13, LEVEL_14]
});
