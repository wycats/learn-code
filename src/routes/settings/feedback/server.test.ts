import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+page.server';
import { LEVEL_1 } from '$lib/game/levels';

const dbMock = vi.hoisted(() => {
	const limit = vi.fn();
	const orderBy = vi.fn(() => ({ limit }));
	const from = vi.fn(() => ({ orderBy }));
	const select = vi.fn(() => ({ from }));

	return { select, from, orderBy, limit };
});

vi.mock('$lib/server/db', () => ({
	db: { select: dbMock.select }
}));

function makeContext() {
	return {
		route: {
			source: 'pack',
			packId: 'basics',
			levelId: LEVEL_1.id,
			url: 'https://example.test/play/basics/level-1'
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
		browser: { online: true }
	};
}

describe('/settings/feedback load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('redirects anonymous visitors to login', async () => {
		await expect(load({ locals: { user: null } } as never)).rejects.toMatchObject({
			status: 302,
			location: '/login'
		});
	});

	it('loads the newest 50 reports for signed-in users without requiring a selected profile', async () => {
		dbMock.limit.mockResolvedValueOnce([
			{
				id: 'feedback-1',
				message: 'It broke',
				email: null,
				url: null,
				packId: 'basics',
				levelId: LEVEL_1.id,
				context: JSON.stringify(makeContext()),
				userId: 'user-1',
				profileId: null,
				createdAt: new Date('2026-05-19T12:00:00Z')
			}
		]);

		const result = (await load({ locals: { user: { id: 'user-1' }, profile: null } } as never)) as {
			reports: ReturnType<typeof import('$lib/server/feedback-inbox').toFeedbackInboxReport>[];
		};

		expect(dbMock.select).toHaveBeenCalled();
		expect(dbMock.orderBy).toHaveBeenCalledOnce();
		expect(dbMock.limit).toHaveBeenCalledWith(50);
		expect(result.reports).toHaveLength(1);
		expect(result.reports[0]).toMatchObject({
			id: 'feedback-1',
			message: 'It broke',
			levelId: LEVEL_1.id,
			profileId: null,
			context: { status: 'valid' }
		});
	});
});
