import { LevelPackSchema } from '../schema';
import { LEVEL_9 } from '../levels';

export const GAUNTLET_PACK = LevelPackSchema.parse({
	id: 'gauntlet',
	name: 'The Gauntlet',
	description: 'Test your skills against hazardous terrain and slippery ice.',
	coverImage: 'flame',
	difficulty: 'intermediate',
	tags: ['hazards', 'ice', 'challenge'],
	levels: [LEVEL_9]
});
