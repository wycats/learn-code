import { describe, it, expect } from 'vitest';
import { LevelDefinitionSchema, LevelPackSchema } from './schema';
import { BookSchema } from './book/schema';
import type { z } from 'zod';
import type { Book } from './book/schema';

type LevelDefinitionInput = z.input<typeof LevelDefinitionSchema>;

describe('Exhaustive Schema Validation', () => {
	it('validates a comprehensive "Kitchen Sink" Level Definition', () => {
		const kitchenSinkLevel: LevelDefinitionInput = {
			id: 'kitchen-sink-level',
			name: 'Kitchen Sink Level',
			description: 'A level containing every possible feature',
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 4 },
			defaultTerrain: 'grass',
			layout: {
				'0,0': 'grass',
				'1,1': 'water',
				'2,2': 'wall',
				'3,3': 'hazard', // Using built-in hazard
				'4,4': 'goal',
				'0,1': 'custom-tile-1',
				'0,2': 'custom-tile-2'
			},
			items: {
				'1,0': { type: 'key', value: 'red', icon: 'key' },
				'2,0': { type: 'custom-item-1', value: true, icon: 'star' }
			},
			cellIds: {
				'0,0': 'uuid-1',
				'1,1': 'uuid-2'
			},
			availableBlocks: ['move-forward', 'turn-left', 'loop', 'call'],
			maxBlocks: 10,
			ambientSoundId: 'forest-ambience',
			initialProgram: [
				{
					id: 'block-1',
					type: 'move-forward'
				},
				{
					id: 'block-2',
					type: 'loop',
					count: 3,
					children: [
						{
							id: 'block-3',
							type: 'turn-left'
						}
					]
				}
			],
			customTiles: {
				'custom-tile-1': {
					id: 'custom-tile-1',
					name: 'Magic Door',
					type: 'wall',
					passableBy: 'key',
					visuals: {
						color: '#ff0000',
						pattern: 'door',
						decal: 'lock'
					}
				},
				'custom-tile-2': {
					id: 'custom-tile-2',
					name: 'Slippery Ice',
					type: 'ice',
					onEnter: 'slide',
					visuals: {
						color: '#aaddff'
					}
				},
				'custom-tile-3': {
					id: 'custom-tile-3',
					name: 'Spikes',
					type: 'hazard',
					onEnter: 'kill',
					visuals: {
						color: '#555555',
						decal: 'spikes'
					}
				}
			},
			customItems: {
				'custom-item-1': {
					id: 'custom-item-1',
					name: 'Super Star',
					behavior: 'collectible',
					visuals: {
						icon: 'star',
						color: 'gold'
					}
				}
			},
			functions: {
				myFunc: [{ id: 'f1', type: 'move-forward' }]
			},
			solutionPar: 5,
			allowInfiniteLoop: true,
			difficulty: 'expert',
			icon: 'star',
			intro: [
				{
					speaker: 'Guide',
					text: 'Welcome to the kitchen sink!',
					emotion: 'happy',
					avatar: 'guide-avatar',
					targets: ['0,0'],
					media: {
						type: 'image',
						src: 'intro.png',
						alt: 'Intro Image'
					},
					advanceCondition: {
						type: 'block-placed',
						blockType: 'move-forward'
					}
				}
			],
			outro: [
				{
					speaker: 'Guide',
					text: 'You did it!',
					isGhost: true
				}
			],
			hints: [
				{
					id: 'hint-1',
					title: 'Try moving',
					text: 'Use the move block.',
					trigger: { type: 'idle', value: 5000 },
					targets: ['block-tray']
				},
				{
					id: 'hint-2',
					text: 'Loop it!',
					trigger: { type: 'attempts', value: 3 }
				}
			],
			characters: [
				{
					id: 'hero',
					name: 'Hero',
					color: 'blue',
					avatar: 'hero.png'
				}
			],
			emotions: [
				{
					id: 'happy',
					name: 'Happy',
					icon: 'smile'
				}
			],
			versionId: 'v1-hash',
			vectorClock: {
				'device-1': 1,
				'device-2': 5
			}
		};

		const result = LevelDefinitionSchema.safeParse(kitchenSinkLevel);
		if (!result.success) {
			console.error('Level Validation Failed:', JSON.stringify(result.error.format(), null, 2));
		}
		expect(result.success).toBe(true);

		// Verify round-trip JSON serialization
		const jsonString = JSON.stringify(kitchenSinkLevel);
		const parsedJson = JSON.parse(jsonString);
		const roundTripResult = LevelDefinitionSchema.safeParse(parsedJson);
		expect(roundTripResult.success).toBe(true);
	});

	it('validates a comprehensive "Kitchen Sink" Book', () => {
		const kitchenSinkBook: Book = {
			chapters: [
				{
					id: 'chapter-1',
					title: 'Chapter One',
					unlockedBy: 'level-1',
					pages: [
						{
							id: 'page-1',
							title: 'Introduction',
							content: [
								{
									type: 'text',
									content: 'Hello world',
									voice: 'guide'
								},
								{
									type: 'image',
									src: 'image.png',
									alt: 'An image',
									caption: 'Figure 1'
								},
								{
									type: 'playground',
									levelId: 'demo-level',
									caption: 'Try this code',
									snippet: {
										gridSize: { width: 4, height: 4 },
										layout: { '0,0': 'grass' },
										start: { x: 0, y: 0 },
										startOrientation: 'S',
										availableBlocks: ['move-forward']
									}
								},
								{
									type: 'component',
									componentName: 'Quiz',
									props: { question: 'What is 2+2?', answer: 4 }
								},
								{
									type: 'voice',
									speaker: 'Zoey',
									content: 'I can speak now!'
								},
								{
									type: 'code',
									content: 'console.log("Hello");'
								}
							]
						}
					]
				}
			]
		};

		const result = BookSchema.safeParse(kitchenSinkBook);
		if (!result.success) {
			console.error('Book Validation Failed:', JSON.stringify(result.error.format(), null, 2));
		}
		expect(result.success).toBe(true);

		// Verify round-trip JSON serialization
		const jsonString = JSON.stringify(kitchenSinkBook);
		const parsedJson = JSON.parse(jsonString);
		const roundTripResult = BookSchema.safeParse(parsedJson);
		expect(roundTripResult.success).toBe(true);
	});

	it('validates a comprehensive Level Pack', () => {
		const kitchenSinkPack = {
			id: 'pack-1',
			name: 'The Ultimate Pack',
			description: 'Contains everything',
			coverImage: 'pack-cover.png',
			difficulty: 'expert',
			tags: ['fun', 'educational'],
			version: '2.0.0',
			levels: [], // Can be empty or contain levels, we tested LevelDefinition above
			characters: [],
			emotions: [],
			customTiles: {},
			customItems: {},
			isCustom: true,
			author: 'Ykatz',
			created: 1234567890,
			updated: 1234567899,
			sourcePackId: 'original-pack'
		};

		// We can reuse the kitchen sink level here if we want, but let's keep it simple
		// to test the pack structure itself.
		const result = LevelPackSchema.safeParse(kitchenSinkPack);
		if (!result.success) {
			console.error('Pack Validation Failed:', JSON.stringify(result.error.format(), null, 2));
		}
		expect(result.success).toBe(true);
	});
});
