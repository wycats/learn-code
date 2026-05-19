import { describe, expect, it, vi } from 'vitest';
import { POST } from './+server';
import { LEVEL_1 } from '$lib/game/levels';

const insertValues = vi.fn();
const onConflictDoNothing = vi.fn();

vi.mock('$lib/server/db', () => ({
	db: {
		insert: vi.fn(() => ({
			values: insertValues.mockReturnValue({ onConflictDoNothing })
		}))
	}
}));

function makePayload(overrides: Record<string, unknown> = {}) {
	return {
		id: 'feedback-1',
		message: 'Something happened',
		email: '',
		createdAt: 1_779_123_512_000,
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
			browser: { online: true }
		},
		...overrides
	};
}

describe('POST /api/feedback', () => {
	it('persists valid feedback with route context', async () => {
		const response = await POST({
			request: new Request('https://example.test/api/feedback', {
				method: 'POST',
				body: JSON.stringify(makePayload())
			}),
			locals: { user: { id: 'user-1' }, profile: { id: 'profile-1' } }
		} as never);

		expect(response.status).toBe(200);
		expect(insertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'feedback-1',
				message: 'Something happened',
				packId: 'vehicles',
				levelId: 'level-boat-intro',
				url: 'https://example.test/play/vehicles/level-boat-intro',
				userId: 'user-1',
				profileId: 'profile-1'
			})
		);
		expect(onConflictDoNothing).toHaveBeenCalled();
	});

	it('rejects invalid feedback', async () => {
		const response = await POST({
			request: new Request('https://example.test/api/feedback', {
				method: 'POST',
				body: JSON.stringify(makePayload({ message: '' }))
			}),
			locals: { user: null, profile: null }
		} as never);

		expect(response.status).toBe(400);
	});

	it('rejects oversized feedback by byte size', async () => {
		const response = await POST({
			request: new Request('https://example.test/api/feedback', {
				method: 'POST',
				body: JSON.stringify(makePayload({ message: '🚢'.repeat(70_000) }))
			}),
			locals: { user: null, profile: null }
		} as never);

		expect(response.status).toBe(413);
	});
});
