import { expect, test, type Page } from '@playwright/test';

async function getBox(page: Page, selector: string) {
	return page.locator(selector).evaluate((element) => {
		const box = element.getBoundingClientRect();
		return {
			width: box.width,
			height: box.height,
			top: box.top,
			bottom: box.bottom
		};
	});
}

test('play layout keeps the board usable at narrow short tablet sizes', async ({ page }) => {
	await page.setViewportSize({ width: 606, height: 615 });
	await page.goto('/play/basics/level-1');

	await expect(page.locator('.stage-container')).toBeVisible();
	await expect(page.locator('.stage-container > .grid-stage')).toBeVisible();

	const header = await getBox(page, 'header');
	const stage = await getBox(page, '.stage-container');
	const grid = await getBox(page, '.stage-container > .grid-stage');
	const firstCell = await getBox(page, '.stage-container .grid-cell-wrapper:first-child');
	const tray = await getBox(page, '.tray-area');

	expect(header.height).toBeLessThan(160);
	expect(stage.height).toBeGreaterThanOrEqual(160);
	expect(grid.height).toBeGreaterThanOrEqual(120);
	expect(firstCell.height).toBeGreaterThanOrEqual(18);
	expect(tray.height).toBeGreaterThanOrEqual(160);

	const hasHorizontalOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth
	);
	expect(hasHorizontalOverflow).toBe(false);
});
