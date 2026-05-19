import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import FeedbackModal from './FeedbackModal.svelte';
import { LEVEL_1 } from '$lib/game/levels';
import type { FeedbackContext } from '$lib/services/feedback-schema';

vi.mock('$lib/services/feedback', () => ({
	feedbackService: {
		submit: vi.fn()
	}
}));

const { feedbackService } = await import('$lib/services/feedback');
const submit = vi.mocked(feedbackService.submit);

function makeContext(): FeedbackContext {
	return {
		route: { source: 'pack', packId: 'basics', levelId: 'level-1' },
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

describe('FeedbackModal', () => {
	it('explains attached context and submits message/email', async () => {
		submit.mockImplementationOnce(async (input) => ({
			status: 'sent',
			item: {
				id: 'feedback-1',
				createdAt: 1,
				...input
			}
		}));
		const onClose = vi.fn();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		render(FeedbackModal as any, { props: { context: makeContext(), onClose } as any });

		await expect.element(page.getByText('Report an issue')).toBeInTheDocument();
		await expect
			.element(page.getByText(/current level, blocks, and runtime\s+state/))
			.toBeInTheDocument();
		await expect.element(page.getByText('Cross the River')).toBeInTheDocument();

		await page.getByTestId('feedback-message').fill('The boat did a strange thing.');
		await page.getByTestId('feedback-email').fill('parent@example.com');
		await page.getByTestId('feedback-submit').click();

		expect(submit).toHaveBeenCalledWith({
			message: 'The boat did a strange thing.',
			email: 'parent@example.com',
			context: makeContext()
		});
		expect(onClose).toHaveBeenCalled();
	});
});
