import { z } from 'zod';

export const DirectionSchema = z.enum(['N', 'E', 'S', 'W']);
export type Direction = z.infer<typeof DirectionSchema>;

export const GridPositionSchema = z.object({
	x: z.number(),
	y: z.number()
});
export type GridPosition = z.infer<typeof GridPositionSchema>;

export const BlockTypeSchema = z.enum([
	'move-forward',
	'turn-left',
	'turn-right',
	'loop',
	'call',
	'pick-up',
	'board'
]);
export type BlockType = z.infer<typeof BlockTypeSchema>;
