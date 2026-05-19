// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedbackService } from './feedback';
import type { FeedbackSubmitInput } from './feedback-schema';
import { LEVEL_1 } from '$lib/game/levels';

const fetchMock = vi.fn();

function makeInput(): FeedbackSubmitInput {
	return {
		message: 'The boat got weird.',
		email: '',
		context: {
			route: {
				source: 'pack',
				packId: 'vehicles',
				levelId: 'level-boat-intro',
				url: 'https://example.test/play/vehicles/level-boat-intro'
			},
			level: LEVEL_1,
			program: [],
			functions: {},
			game: {
				status: 'planning',
				activeBlockId: null,
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
				failedAttempts: 0,
				lastEvent: null,
				storyIndex: 0,
				activeHintId: null
			},
			browser: {
				online: true,
				userAgent: 'Vitest'
			}
		}
	};
}

function setOnline(online: boolean) {
	Object.defineProperty(navigator, 'onLine', {
		configurable: true,
		value: online
	});
}

describe('FeedbackService', () => {
	beforeEach(() => {
		localStorage.clear();
		fetchMock.mockReset();
		vi.stubGlobal('fetch', fetchMock);
		setOnline(true);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sends feedback immediately when online', async () => {
		fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
		const service = FeedbackService.createForTesting();

		const result = await service.submit(makeInput());

		expect(result.status).toBe('sent');
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/feedback',
			expect.objectContaining({ method: 'POST' })
		);
		expect(service.getPendingCount()).toBe(0);
	});

	it('queues feedback while offline', async () => {
		setOnline(false);
		const service = FeedbackService.createForTesting();

		const result = await service.submit(makeInput());

		expect(result.status).toBe('queued');
		expect(fetchMock).not.toHaveBeenCalled();
		expect(service.getPendingCount()).toBe(1);
	});

	it('flushes queued feedback when online', async () => {
		setOnline(false);
		const service = FeedbackService.createForTesting();
		await service.submit(makeInput());
		setOnline(true);
		fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));

		await service.flushQueue();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(service.getPendingCount()).toBe(0);
	});

	it('drops invalid queued feedback after a 4xx response', async () => {
		setOnline(false);
		const service = FeedbackService.createForTesting();
		await service.submit(makeInput());
		setOnline(true);
		fetchMock.mockResolvedValueOnce(new Response('{}', { status: 400 }));

		await service.flushQueue();

		expect(service.getPendingCount()).toBe(0);
	});
});
