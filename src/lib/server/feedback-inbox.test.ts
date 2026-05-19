import { describe, expect, it } from 'vitest';
import type { Feedback } from './db/schema';
import { LEVEL_1 } from '$lib/game/levels';
import { summarizeFeedbackContext, toFeedbackInboxReport } from './feedback-inbox';

function makeContext(overrides: Record<string, unknown> = {}) {
	return {
		route: {
			source: 'pack',
			packId: 'basics',
			levelId: LEVEL_1.id,
			url: 'https://example.test/play/basics/level-1'
		},
		level: LEVEL_1,
		program: [{ id: 'block-1', type: 'move-forward' }],
		functions: {
			patrol: [{ id: 'block-2', type: 'turn-left' }]
		},
		game: {
			status: 'running',
			activeBlockId: 'block-1',
			editingContext: null,
			characterPosition: LEVEL_1.start,
			characterOrientation: LEVEL_1.startOrientation,
			lives: 1,
			maxLives: 1,
			heldItem: null,
			vehicle: null,
			collectedItems: [],
			executionState: [],
			loopProgress: [],
			failedAttempts: 2,
			lastEvent: null,
			storyIndex: 0,
			activeHintId: null
		},
		interpreter: {
			phase: 'before',
			stackDepth: 1,
			stack: [
				{
					index: 0,
					blockId: 'block-1',
					context: 'main',
					blockIds: ['block-1']
				}
			]
		},
		browser: {
			online: true,
			userAgent: 'Test Browser',
			language: 'en-US',
			viewport: { width: 800, height: 600 }
		},
		...overrides
	};
}

function makeFeedback(overrides: Partial<Feedback> = {}): Feedback {
	return {
		id: 'feedback-1',
		message: 'A detailed message about a broken level.',
		email: null,
		url: 'https://example.test/play/basics/level-1',
		packId: 'basics',
		levelId: LEVEL_1.id,
		context: JSON.stringify(makeContext()),
		userId: 'user-1',
		profileId: 'profile-1',
		createdAt: new Date('2026-05-19T12:00:00Z'),
		...overrides
	};
}

describe('summarizeFeedbackContext', () => {
	it('summarizes valid context for the inbox without exposing full nested objects as data', () => {
		const summary = summarizeFeedbackContext(JSON.stringify(makeContext()));

		expect(summary.status).toBe('valid');
		expect(summary.level).toEqual({ id: LEVEL_1.id, name: LEVEL_1.name });
		expect(summary.game).toEqual({
			status: 'running',
			failedAttempts: 2,
			activeBlockId: 'block-1'
		});
		expect(summary.programCount).toBe(1);
		expect(summary.functionsCount).toBe(1);
		expect(summary.browser?.viewport).toBe('800 × 600');
		expect(summary.interpreter).toEqual({
			phase: 'before',
			stackDepth: 1,
			currentBlockId: 'block-1',
			currentContext: 'main',
			currentFrameSize: 1
		});
	});

	it('keeps empty legacy context safe and inspectable', () => {
		const summary = summarizeFeedbackContext('{}');

		expect(summary.status).toBe('empty');
		expect(summary.error).toBeTruthy();
		expect(summary.raw).toBe('{}');
		expect(summary.level).toBeNull();
	});

	it('keeps malformed context safe and inspectable', () => {
		const summary = summarizeFeedbackContext('{not json');

		expect(summary.status).toBe('invalid-json');
		expect(summary.error).toBeTruthy();
		expect(summary.raw).toBe('{not json');
	});

	it('keeps structurally invalid context safe and inspectable', () => {
		const summary = summarizeFeedbackContext(JSON.stringify({ route: { source: 'pack' } }));

		expect(summary.status).toBe('invalid-shape');
		expect(summary.error).toBeTruthy();
		expect(summary.raw).toContain('route');
	});
});

describe('toFeedbackInboxReport', () => {
	it('serializes feedback rows for the settings inbox', () => {
		const report = toFeedbackInboxReport(
			makeFeedback({
				message: `First line\n${'Second line '.repeat(20)}`,
				email: 'parent@example.test'
			})
		);

		expect(report.createdAtIso).toBe('2026-05-19T12:00:00.000Z');
		expect(report.messagePreview).toContain('First line Second line');
		expect(report.messagePreview.length).toBeLessThanOrEqual(140);
		expect(report.email).toBe('parent@example.test');
		expect(report.context.status).toBe('valid');
	});
});
