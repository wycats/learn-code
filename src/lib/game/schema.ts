import { z } from 'zod';

export const DirectionSchema = z.enum(['N', 'E', 'S', 'W']);
export type Direction = z.infer<typeof DirectionSchema>;

export const BlockTypeSchema = z.enum(['move-forward', 'turn-left', 'turn-right', 'loop', 'call']);
export type BlockType = z.infer<typeof BlockTypeSchema>;

// Recursive schema for Block needs lazy evaluation if we want full validation,
// but for simple JSON storage, we can define the base structure.
// Zod recursive types are a bit verbose, let's start simple.
export type Block = {
	id: string;
	type: BlockType;
	count?: number;
	children?: Block[];
	isGhost?: boolean;
	functionName?: string;
};

export const BlockSchema: z.ZodType<Block> = z.lazy(() =>
	z.object({
		id: z.string(),
		type: BlockTypeSchema,
		count: z.number().optional(),
		children: z.array(BlockSchema).optional(),
		isGhost: z.boolean().optional(),
		functionName: z.string().optional()
	})
);

export const GridPositionSchema = z.object({
	x: z.number(),
	y: z.number()
});
export type GridPosition = z.infer<typeof GridPositionSchema>;

export const CellTypeSchema = z.enum(['grass', 'water', 'wall', 'goal']);
export type CellType = z.infer<typeof CellTypeSchema>;

export const CellSchema = z.object({
	type: CellTypeSchema,
	position: GridPositionSchema
});
export type Cell = z.infer<typeof CellSchema>;

export const GameStatusSchema = z.enum(['planning', 'running', 'won', 'lost', 'story', 'goal']);
export type GameStatus = z.infer<typeof GameStatusSchema>;

export const StorySegmentSchema = z.object({
	speaker: z.enum(['Zoey', 'Jonas', 'System']),
	text: z.string(),
	audioId: z.string().optional(),
	emotion: z.enum(['happy', 'neutral', 'concerned', 'excited']).optional(),
	highlight: z
		.object({
			target: z.string(), // e.g., 'block:move-forward', 'cell:2,2', 'ui:play-btn'
			type: z.enum(['pulse', 'arrow', 'dim']).optional()
		})
		.optional(),
	advanceCondition: z
		.object({
			type: z.enum(['block-placed', 'program-run', 'level-complete']),
			blockType: BlockTypeSchema.optional()
		})
		.optional()
});
export type StorySegment = z.infer<typeof StorySegmentSchema>;

export const LevelDefinitionSchema = z.object({
	id: z.string(),
	name: z.string(),
	gridSize: z.object({
		width: z.number(),
		height: z.number()
	}),
	start: GridPositionSchema,
	startOrientation: DirectionSchema,
	goal: GridPositionSchema,
	layout: z.record(z.string(), CellTypeSchema), // Key is "x,y"
	availableBlocks: z.array(BlockTypeSchema),
	maxBlocks: z.number().optional(),
	ambientSoundId: z.string().optional(),
	initialProgram: z.array(BlockSchema).optional(),
	functions: z.record(z.string(), z.array(BlockSchema)).optional(),
	solutionPar: z.number().optional(),
	intro: z.array(StorySegmentSchema).optional(),
	outro: z.array(StorySegmentSchema).optional()
});
export type LevelDefinition = z.infer<typeof LevelDefinitionSchema>;
