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

export const TileTypeSchema = z.enum(['wall', 'floor', 'hazard', 'water', 'ice']);
export type TileType = z.infer<typeof TileTypeSchema>;

export const TileDefinitionSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: TileTypeSchema,
	visuals: z.object({
		color: z.string(),
		pattern: z.string().optional(),
		decal: z.string().optional()
	})
});
export type TileDefinition = z.infer<typeof TileDefinitionSchema>;

// We allow any string now to support custom tile IDs, but keep the enum for reference/defaults
export const BuiltInCellTypeSchema = z.enum([
	'grass',
	'water',
	'wall',
	'goal',
	'sand',
	'snow',
	'forest',
	'dirt'
]);
export const CellTypeSchema = z.string();
export type CellType = z.infer<typeof CellTypeSchema>;

export const CellSchema = z.object({
	type: CellTypeSchema,
	position: GridPositionSchema
});
export type Cell = z.infer<typeof CellSchema>;

export const GameStatusSchema = z.enum(['planning', 'running', 'won', 'lost', 'story', 'goal']);
export type GameStatus = z.infer<typeof GameStatusSchema>;

export const CharacterSchema = z.object({
	id: z.string(),
	name: z.string(),
	color: z.string(),
	avatar: z.string().optional()
});
export type Character = z.infer<typeof CharacterSchema>;

export const EmotionSchema = z.object({
	id: z.string(),
	name: z.string(),
	icon: z.string()
});
export type Emotion = z.infer<typeof EmotionSchema>;

export const StorySegmentSchema = z.object({
	id: z.string().optional(),
	speaker: z.string(),
	text: z.string(),
	audioId: z.string().optional(),
	emotion: z.string().optional(),
	highlight: z
		.object({
			target: z.string(), // e.g., 'block:move-forward', 'cell:2,2', 'ui:play-btn'
			type: z.enum(['pulse', 'arrow', 'dim']).optional()
		})
		.optional(),
	media: z
		.object({
			type: z.enum(['image', 'video']),
			src: z.string(),
			alt: z.string()
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

export const HintTriggerSchema = z.discriminatedUnion('type', [
	z.object({ type: z.literal('time'), value: z.number() }),
	z.object({ type: z.literal('attempts'), value: z.number() }),
	z.object({ type: z.literal('idle'), value: z.number() }),
	z.object({ type: z.literal('story-step'), segmentId: z.string() }),
	z.object({
		type: z.literal('analysis'),
		pattern: z.enum(['redundant-turn', '360-turn', 'empty-loop', 'missed-loop'])
	})
]);
export type HintTrigger = z.infer<typeof HintTriggerSchema>;

export const HintSchema = z.object({
	id: z.string(),
	title: z.string().optional(),
	text: z.string(),
	trigger: HintTriggerSchema,
	highlight: z.string().optional()
});
export type Hint = z.infer<typeof HintSchema>;

export const LevelDefinitionSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().optional(),
	gridSize: z.object({
		width: z.number(),
		height: z.number()
	}),
	start: GridPositionSchema,
	startOrientation: DirectionSchema,
	goal: GridPositionSchema,
	defaultTerrain: CellTypeSchema.optional(),
	layout: z.record(z.string(), CellTypeSchema), // Key is "x,y"
	availableBlocks: z
		.union([
			z.array(BlockTypeSchema),
			z.record(z.string(), z.union([z.number(), z.literal('unlimited')]))
		])
		.transform((val) => {
			if (Array.isArray(val)) {
				return val.reduce(
					(acc, type) => {
						acc[type] = 'unlimited';
						return acc;
					},
					{} as Record<string, number | 'unlimited'>
				);
			}
			return val;
		}),
	maxBlocks: z.number().optional(),
	ambientSoundId: z.string().optional(),
	initialProgram: z.array(BlockSchema).optional(),
	customTiles: z.record(z.string(), TileDefinitionSchema).optional(),
	functions: z.record(z.string(), z.array(BlockSchema)).optional(),
	solutionPar: z.number().optional(),
	intro: z.array(StorySegmentSchema).optional(),
	outro: z.array(StorySegmentSchema).optional(),
	hints: z.array(HintSchema).optional(),
	characters: z.array(CharacterSchema).optional(),
	emotions: z.array(EmotionSchema).optional()
});
export type LevelDefinition = z.infer<typeof LevelDefinitionSchema>;

export const LevelPackSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().optional(),
	version: z.string().default('1.0.0'),
	levels: z.array(LevelDefinitionSchema),
	characters: z.array(CharacterSchema).optional(),
	emotions: z.array(EmotionSchema).optional()
});
export type LevelPack = z.infer<typeof LevelPackSchema>;
