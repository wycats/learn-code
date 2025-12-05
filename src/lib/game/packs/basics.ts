import { LevelPackSchema } from '../schema';
import { LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7, LEVEL_8 } from '../levels';

export const BASICS_PACK = LevelPackSchema.parse({
	id: 'basics',
	name: 'The Basics',
	description: 'Learn the fundamentals of movement, loops, and debugging.',
	coverImage: 'book',
	difficulty: 'beginner',
	tags: ['tutorial', 'loops', 'debugging'],
	levels: [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7, LEVEL_8]
});
