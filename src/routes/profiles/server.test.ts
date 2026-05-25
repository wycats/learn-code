import { describe, expect, it, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import { setActiveProfileCookie } from '$lib/server/auth';

const dbMock = vi.hoisted(() => {
	const values = vi.fn();
	const insert = vi.fn(() => ({ values }));
	const findFirst = vi.fn();
	const findMany = vi.fn();

	return { insert, values, findFirst, findMany };
});

vi.mock('$lib/server/db', () => ({
	db: {
		insert: dbMock.insert,
		query: {
			profile: {
				findFirst: dbMock.findFirst,
				findMany: dbMock.findMany
			}
		}
	}
}));

vi.mock('$lib/server/auth', async () => {
	const actual = await vi.importActual<typeof import('$lib/server/auth')>('$lib/server/auth');
	return {
		...actual,
		setActiveProfileCookie: vi.fn()
	};
});

function makeRequest(body: Record<string, string>) {
	return new Request('https://example.test/profiles', {
		method: 'POST',
		body: new URLSearchParams(body)
	});
}

describe('/profiles actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('redirects with 303 after creating a profile so browsers follow with GET', async () => {
		await expect(
			actions.createProfile({
				locals: { user: { id: 'user-1' } },
				request: makeRequest({ nickname: 'Zoey', avatar: 'cat', color: '#3b82f6' })
			} as never)
		).rejects.toMatchObject({ status: 303, location: '/' });

		expect(dbMock.insert).toHaveBeenCalled();
		expect(dbMock.values).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user-1',
				nickname: 'Zoey',
				avatar: 'cat',
				color: '#3b82f6'
			})
		);
		expect(setActiveProfileCookie).toHaveBeenCalled();
	});

	it('redirects with 303 after selecting a profile so browsers follow with GET', async () => {
		dbMock.findFirst.mockResolvedValueOnce({ id: 'profile-1', userId: 'user-1' });

		await expect(
			actions.selectProfile({
				locals: { user: { id: 'user-1' } },
				request: makeRequest({ profileId: 'profile-1' })
			} as never)
		).rejects.toMatchObject({ status: 303, location: '/' });

		expect(setActiveProfileCookie).toHaveBeenCalled();
	});
});
