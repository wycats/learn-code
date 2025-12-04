import { z } from 'zod';
import { BlockTypeSchema, DirectionSchema, GridPositionSchema } from '../schema';

const TextBlock = z.object({
	type: z.literal('text'),
	content: z.string(),
	voice: z.enum(['guide', 'zoey', 'jonas']).default('guide')
});

const ImageBlock = z.object({
	type: z.literal('image'),
	src: z.string(),
	alt: z.string(),
	caption: z.string().optional()
});

const PlaygroundBlock = z.object({
	type: z.literal('playground'),
	levelId: z.string().optional(),
	snippet: z
		.object({
			gridSize: z
				.object({ width: z.number(), height: z.number() })
				.default({ width: 3, height: 3 }),
			layout: z.record(z.string(), z.string()).optional(),
			start: GridPositionSchema.optional(),
			startOrientation: DirectionSchema.optional(),
			availableBlocks: z.array(BlockTypeSchema).optional()
		})
		.optional(),
	caption: z.string().optional()
});

const ComponentBlock = z.object({
	type: z.literal('component'),
	componentName: z.string(),
	props: z.record(z.string(), z.any()).optional()
});

export const BookContentBlockSchema = z.union([
	TextBlock,
	ImageBlock,
	PlaygroundBlock,
	ComponentBlock
]);

export const BookPageSchema = z.object({
	id: z.string(),
	title: z.string(),
	content: z.array(BookContentBlockSchema)
});

export const BookChapterSchema = z.object({
	id: z.string(),
	title: z.string(),
	pages: z.array(BookPageSchema),
	unlockedBy: z.string().optional()
});

export const BookSchema = z.object({
	chapters: z.array(BookChapterSchema)
});

export type BookContentBlock = z.infer<typeof BookContentBlockSchema>;
export type BookPage = z.infer<typeof BookPageSchema>;
export type BookChapter = z.infer<typeof BookChapterSchema>;
export type Book = z.infer<typeof BookSchema>;
