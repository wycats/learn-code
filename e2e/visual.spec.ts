import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
	test('Home Screen', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveScreenshot('home-screen.png');
	});

	test('Library Screen', async ({ page }) => {
		await page.goto('/library');
		// Wait for the packs to load if they are async, but they are likely static or fast enough.
		// We can wait for a specific element to be sure.
		await expect(page.locator('h1')).toContainText('Code Climber');
		await expect(page).toHaveScreenshot('library-screen.png');
	});

	test('Game Interface - Level 1', async ({ page }) => {
		// We assume 'basics' and 'level-1' exist as they are standard.
		// If not, we might need to adjust.
		await page.goto('/play/basics/level-1');
		
		// Wait for the game grid to be visible
		await expect(page.locator('.stage-container')).toBeVisible();
		
		// Wait for the instruction bar (it's inside dashboard-layer)
		await expect(page.locator('.dashboard-layer')).toBeVisible();

		await expect(page).toHaveScreenshot('game-level-1.png');
	});

	test('Builder Interface', async ({ page }) => {
		await page.goto('/builder');
		
		// Wait for the tray area to be visible
		await expect(page.locator('.tray-area')).toBeVisible();
		
		// Wait for the grid container
		await expect(page.locator('.grid-container')).toBeVisible();

		await expect(page).toHaveScreenshot('builder-screen.png');
	});
});
