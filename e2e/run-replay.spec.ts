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
	await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible({ timeout: 7000 });
	await expect(page.getByText('Try Again').first()).toBeVisible();
	await expect(page.getByText('Run stopped. Try Again or edit after Reset.')).toBeVisible();

	await page.getByRole('button', { name: 'Try Again' }).click();
	await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible({ timeout: 7000 });
});

test('Replay resets and reruns the same winning program immediately', async ({ page }) => {
	await enterPlanning(page);
	await addStepBlocks(page, 4);

	await page.getByRole('button', { name: 'Play' }).click();
	const winModal = page.locator('.win-modal');
	await expect(winModal).toBeVisible({ timeout: 7000 });
	await expect(page.getByLabel('Replay')).toBeVisible();

	await winModal.getByRole('button', { name: 'Replay' }).click();
	await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
	await expect(winModal).toBeVisible({ timeout: 7000 });
});
