import { test, expect, type Page } from '@playwright/test';

async function advanceToPlanning(page: Page) {
	await expect(page.locator('.stage-container')).toBeVisible();

	const goalModal = page.locator('.goal-modal');
	while (!(await goalModal.isVisible())) {
		const nextButton = page.locator('.next-btn');
		if (!(await nextButton.isVisible())) break;
		await nextButton.click();
		await expect(page.locator('.dashboard-area')).toBeVisible();
	}

	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'goal');
	await goalModal.getByRole('button', { name: 'Start Planning' }).click();
	await expect(goalModal).not.toBeVisible();
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'planning');
}

async function addBlock(page: Page, type: string, count = 1) {
	const block = page.locator(`.block-list .block[data-type="${type}"]`);
	await expect(block).toBeVisible();

	for (let i = 0; i < count; i++) {
		await block.click();
	}
}

test('The Lost Fleet is visible in Library and opens its boat levels', async ({ page }) => {
	await page.goto('/library');

	await expect(page.getByText('The Lost Fleet')).toBeVisible();
	await page.getByText('The Lost Fleet').click();

	await expect(page).toHaveURL(/\/library\/vehicles$/);
	await expect(page.getByRole('heading', { name: 'The Lost Fleet' })).toBeVisible();
	await expect(page.getByText('Set Sail')).toBeVisible();
	await expect(page.getByText('Island Hopping')).toBeVisible();
	await expect(page.getByText('Row Your Boat')).toBeVisible();
});

test('/library/vehicles loads The Lost Fleet directly', async ({ page }) => {
	await page.goto('/library/vehicles');

	await expect(page.getByRole('heading', { name: 'The Lost Fleet' })).toBeVisible();
	await expect(
		page.getByText('Master the art of sailing and explore the high seas.')
	).toBeVisible();
	await expect(page.getByText('Set Sail')).toBeVisible();
});

test('Set Sail is playable as the first Lost Fleet level', async ({ page }) => {
	await page.goto('/play/vehicles/level-boat-intro');

	await expect(page.locator('.play-container')).toBeVisible();
	await expect(page.getByRole('button', { name: 'The Lost Fleet' })).toBeVisible();
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'story');
	await expect(page.locator('.block-list .block[data-type="board"]')).toBeVisible();
});

test('Set Sail can be won by boarding the boat and crossing water', async ({ page }) => {
	await page.goto('/play/vehicles/level-boat-intro');
	await advanceToPlanning(page);

	await addBlock(page, 'move-forward');
	await addBlock(page, 'board');
	await addBlock(page, 'move-forward', 2);

	await expect(page.locator('.program-list .block[data-type="move-forward"]')).toHaveCount(3);
	await expect(page.locator('.program-list .block[data-type="board"]')).toHaveCount(1);

	await page.getByRole('button', { name: 'Play' }).click();

	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'running');
	await expect(page.locator('.win-modal')).toBeVisible({ timeout: 7000 });
	await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'won');
});
