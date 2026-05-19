import { test, expect, type Page } from '@playwright/test';

async function enterPlanning(page: Page) {
	await page.goto('/play/basics/level-1');
	await expect(page.locator('.stage-container')).toBeVisible();

	const goalModal = page.locator('.goal-modal');
	while (!(await goalModal.isVisible())) {
		const nextButton = page.locator('.next-btn');
		if (!(await nextButton.isVisible())) break;
		await nextButton.click();
		await expect(page.locator('.dashboard-area')).toBeVisible();
	}

	if (await goalModal.isVisible()) {
		await goalModal.getByRole('button', { name: 'Start Planning' }).click();
		await expect(goalModal).not.toBeVisible();
	}

	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'planning');
}

test('feedback modal submits state context from a playable level', async ({ page }) => {
	let payload: {
		message?: string;
		context?: {
			route?: { packId?: string; levelId?: string };
			level?: { id?: string };
			game?: { status?: string };
			program?: unknown[];
		};
	};
	await page.route('/api/feedback', async (route) => {
		payload = route.request().postDataJSON();
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ success: true })
		});
	});

	await enterPlanning(page);
	await page.locator('.block-list .block[data-type="move-forward"]').click();
	await page.getByRole('button', { name: 'Report Issue' }).click();

	await expect(page.getByRole('dialog', { name: 'Report an issue' })).toBeVisible();
	await expect(page.getByText(/current level, blocks, and runtime\s+state/)).toBeVisible();
	await page.getByTestId('feedback-message').fill('The first bridge step looked wrong.');
	await page.getByTestId('feedback-submit').click();

	await expect(page.getByText('Feedback sent. Thank you!')).toBeVisible();
	await expect.poll(() => payload?.message).toBe('The first bridge step looked wrong.');
	await expect.poll(() => payload?.context?.route?.packId).toBe('basics');
	expect(payload.context.route.levelId).toBe('level-1');
	expect(payload.context.level.id).toBe('level-1');
	expect(payload.context.game.status).toBe('planning');
	expect(payload.context.program).toEqual([{ id: expect.any(String), type: 'move-forward' }]);
});
