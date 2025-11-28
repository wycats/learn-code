import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GameModel } from './model.svelte';
import type { LevelDefinition } from './types';

describe('GameModel Hints', () => {
	let model: GameModel;
	let level: LevelDefinition;

	beforeEach(() => {
		vi.useFakeTimers();
		level = {
			id: 'test-level',
			name: 'Test Level',
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			gridSize: { width: 5, height: 5 },
			layout: {},
			goal: { x: 4, y: 4 },
			availableBlocks: { 'move-forward': 'unlimited' },
			hints: [
				{
					id: 'hint-time',
					text: 'Time hint',
					trigger: { type: 'time', value: 10 } // 10 seconds
				},
				{
					id: 'hint-attempts',
					text: 'Attempts hint',
					trigger: { type: 'attempts', value: 2 }
				},
				{
					id: 'hint-idle',
					text: 'Idle hint',
					trigger: { type: 'idle', value: 5 } // 5 seconds
				}
			]
		};
		model = new GameModel(level);
		model.status = 'planning'; // Ensure we can add blocks
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should trigger time-based hint', () => {
		// Advance time by 11 seconds
		vi.advanceTimersByTime(11000);
		
		model.checkHints();
		
		expect(model.activeHintId).toBe('hint-time');
		expect(model.displaySegment?.text).toBe('Time hint');
		expect(model.displaySegment?.speaker).toBe('Guide');
	});

	it('should trigger attempts-based hint', () => {
		// Ensure time hint doesn't trigger
		vi.advanceTimersByTime(1000);

		model.recordFailure();
		model.checkHints();
		expect(model.activeHintId).toBeNull(); 

		model.recordFailure();
		model.checkHints();
		expect(model.activeHintId).toBe('hint-attempts');
	});

	it('should trigger idle-based hint', () => {
		// Remove other hints to isolate idle
		model.level.hints = [
			{
				id: 'hint-idle',
				text: 'Idle hint',
				trigger: { type: 'idle', value: 5 }
			}
		];

		// Advance time by 6 seconds without interaction
		vi.advanceTimersByTime(6000);
		
		model.checkHints();
		
		expect(model.activeHintId).toBe('hint-idle');
	});

	it('should reset idle timer on interaction', () => {
		// Remove other hints to isolate idle
		model.level.hints = [
			{
				id: 'hint-idle',
				text: 'Idle hint',
				trigger: { type: 'idle', value: 5 }
			}
		];

		// Advance 3 seconds
		vi.advanceTimersByTime(3000);
		model.recordInteraction();
		
		// Advance another 3 seconds (total 6, but only 3 since interaction)
		vi.advanceTimersByTime(3000);
		
		model.checkHints();
		expect(model.activeHintId).toBeNull();
		
		// Advance another 3 seconds (total 6 since interaction)
		vi.advanceTimersByTime(3000);
		model.checkHints();
		expect(model.activeHintId).toBe('hint-idle');
	});

	it('should trigger story-step hint', () => {
		model.level.intro = [
			{ id: 'step-1', speaker: 'System', text: 'Intro 1' },
			{ id: 'step-2', speaker: 'System', text: 'Intro 2' }
		];
		model.level.hints = [
			{
				id: 'hint-step',
				text: 'Step hint',
				trigger: { type: 'story-step', segmentId: 'step-2' }
			}
		];
		model.status = 'story';
		model.storyIndex = 0;

		model.checkHints();
		expect(model.activeHintId).toBeNull();

		model.storyIndex = 1; // Should correspond to step-2
		model.checkHints();
		expect(model.activeHintId).toBe('hint-step');
	});
});
