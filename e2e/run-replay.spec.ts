import { test, expect, type Page } from '@playwright/test';

async function enterPlanning(page: Page) {
	await page.goto('/play/basics/level-1');
	await expect(page.locator('.stage-container')).toBeVisible();
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'story');

	const goalModal = page.locator('.goal-modal');
	while (!(await goalModal.isVisible())) {
		const nextButton = page.locator('.next-btn');
		if (!(await nextButton.isVisible())) break;
		await nextButton.click();
		await expect(page.locator('.dashboard-area')).toBeVisible();
	}

	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'goal');

	if (await goalModal.isVisible()) {
		await goalModal.getByRole('button', { name: 'Start Planning' }).click();
		await expect(goalModal).not.toBeVisible();
	}

	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'planning');
}

async function addStepBlocks(page: Page, count: number) {
	const moveBlock = page.locator('.block-list .block[data-type="move-forward"]');
	await expect(moveBlock).toBeVisible();
	for (let i = 0; i < count; i++) {
		await moveBlock.click();
	}
}

test('Try Again resets and reruns the same failed program immediately', async ({ page }) => {
	await enterPlanning(page);

	const moveBlock = page.locator('.block-list .block[data-type="move-forward"]');
	const turnLeftBlock = page.locator('.block-list .block[data-type="turn-left"]');
	await moveBlock.click();
	await moveBlock.click();
	await moveBlock.click();
	await turnLeftBlock.click();
	await moveBlock.click();

	await page.getByRole('button', { name: 'Play' }).click();
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'running');
	await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible({ timeout: 7000 });
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'lost');
	await expect(page.locator('.status-panel').getByText('Try Again')).toBeVisible();
	await expect(page.getByText('Run stopped. Try Again, or Reset to edit.')).toBeVisible();

	await page.getByRole('button', { name: 'Try Again' }).click();
	await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'running');
	await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible({ timeout: 7000 });
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'lost');
});

test('Replay resets and reruns the same winning program immediately', async ({ page }) => {
	await enterPlanning(page);
	await addStepBlocks(page, 4);

	await page.getByRole('button', { name: 'Play' }).click();
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'running');
	const winModal = page.locator('.win-modal');
	await expect(winModal).toBeVisible({ timeout: 7000 });
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'won');
	await expect(page.getByLabel('Replay')).toBeVisible();

	await winModal.getByRole('button', { name: 'Replay' }).click();
	await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'running');
	await expect(winModal).toBeVisible({ timeout: 7000 });
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'won');
});

test('Step mode has a visible paused indicator without changing run controls', async ({ page }) => {
	await enterPlanning(page);
	await addStepBlocks(page, 2);

	await page.locator('button[title="Step Forward"]').click();

	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'paused');
	await expect(page.getByTestId('status-panel-step-mode')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Play' })).toBeEnabled();
});

test('Ghost Path preview appears while planning and hides while running', async ({ page }) => {
	await enterPlanning(page);
	await expect(page.getByTestId('ghost-path-preview')).not.toBeVisible();

	await addStepBlocks(page, 4);

	await expect(page.getByTestId('ghost-path-preview')).toBeVisible();
	await expect(page.getByTestId('ghost-path-preview')).toHaveAttribute('data-outcome', 'won');
	await expect(page.getByTestId('ghost-path-status')).toContainText('Ghost Path: reaches the goal');
	await expect(page.getByTestId('ghost-path-step')).toHaveCount(5);

	await page.getByRole('button', { name: 'Play' }).click();

	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'running');
	await expect(page.getByTestId('ghost-path-preview')).not.toBeVisible();
	await expect(page.getByTestId('ghost-path-status')).not.toBeVisible();
});
