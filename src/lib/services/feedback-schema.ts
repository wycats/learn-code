import { z } from 'zod';
import {
	BlockSchema,
	DirectionSchema,
	GameStatusSchema,
	GridPositionSchema,
	HeldItemSchema,
	LevelDefinitionSchema
} from '$lib/game/schema';

export const FeedbackRouteContextSchema = z.object({
	source: z.enum(['pack', 'shared']).default('pack'),
	packId: z.string().min(1).max(200).optional(),
	levelId: z.string().min(1).max(200).optional(),
	url: z.string().max(2000).optional()
});

export type FeedbackRouteContext = z.infer<typeof FeedbackRouteContextSchema>;

const ExecutionStateEntrySchema = z.tuple([z.string(), z.enum(['success', 'failure', 'running'])]);
const LoopProgressEntrySchema = z.tuple([z.string(), z.number()]);

const FeedbackInterpreterFrameSchema = z.object({
	index: z.number().int().min(0),
	loopCounter: z.number().optional(),
	loopMax: z.number().optional(),
	blockId: z.string().optional(),
	context: z.string().nullable().optional(),
	blockIds: z.array(z.string())
});

export const FeedbackGameStateSchema = z.object({
	status: GameStatusSchema,
	activeBlockId: z.string().nullable(),
	editingContext: z.string().nullable(),
	characterPosition: GridPositionSchema,
	characterOrientation: DirectionSchema,
	lives: z.number(),
	maxLives: z.number(),
	heldItem: HeldItemSchema.nullable(),
	vehicle: HeldItemSchema.nullable(),
	collectedItems: z.array(z.string()),
	executionState: z.array(ExecutionStateEntrySchema),
	loopProgress: z.array(LoopProgressEntrySchema),
	failedAttempts: z.number(),
	lastEvent: z
		.object({
			type: z.enum(['blocked', 'win', 'fail']),
			reason: z.string().optional(),
			timestamp: z.number()
		})
		.nullable(),
	storyIndex: z.number(),
	activeHintId: z.string().nullable()
});

export const FeedbackBrowserContextSchema = z.object({
	online: z.boolean(),
	userAgent: z.string().max(1000).optional(),
	language: z.string().max(100).optional(),
	viewport: z
		.object({
			width: z.number().int().min(0),
			height: z.number().int().min(0)
		})
		.optional()
});

export const FeedbackContextSchema = z.object({
	route: FeedbackRouteContextSchema,
	level: LevelDefinitionSchema,
	program: z.array(BlockSchema),
	functions: z.record(z.string(), z.array(BlockSchema)),
	game: FeedbackGameStateSchema,
	interpreter: z
		.object({
			phase: z.enum(['before', 'after']).optional(),
			stackDepth: z.number().int().min(0),
			stack: z.array(FeedbackInterpreterFrameSchema)
		})
		.optional(),
	browser: FeedbackBrowserContextSchema
});

export type FeedbackContext = z.infer<typeof FeedbackContextSchema>;

export const FeedbackPayloadSchema = z.object({
	id: z.string().min(1).max(120),
	message: z.string().trim().min(1).max(5000),
	email: z.string().email().optional().or(z.literal('')),
	createdAt: z.number().int().nonnegative(),
	context: FeedbackContextSchema
});

export type FeedbackPayload = z.infer<typeof FeedbackPayloadSchema>;

export const FeedbackSubmitInputSchema = FeedbackPayloadSchema.omit({
	id: true,
	createdAt: true
});

export type FeedbackSubmitInput = z.infer<typeof FeedbackSubmitInputSchema>;
