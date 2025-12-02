import { test, expect } from '@playwright/test';

test.describe('Visual Regression Suite', () => {
	test.beforeEach(async () => {
		// Set a consistent viewport for mobile testing if needed,
		// though playwright.config.ts usually handles projects.
		// We'll rely on the config for now.
	});

	test('Home Page', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveScreenshot('home-page.png', { fullPage: true });
	});

	test('Library (Packs)', async ({ page }) => {
		await page.goto('/library');
		await page.waitForLoadState('networkidle');
		// Wait for the packs to load
		await expect(page.getByRole('heading', { name: 'The Basics' })).toBeVisible();
		await expect(page).toHaveScreenshot('library-page.png', { fullPage: true });
	});

	test('Builder (New Level)', async ({ page }) => {
		await page.goto('/builder');
		await page.waitForLoadState('networkidle');
		// Wait for the grid to be visible
		await expect(page.locator('.grid-stage')).toBeVisible();
		// Open the palette to ensure it's captured
		// (Assuming it's open by default or we want to capture the default state)
		await expect(page).toHaveScreenshot('builder-new.png', { fullPage: true });
	});

	test('Game (Level 1)', async ({ page }) => {
		await page.goto('/play/basics/level-1');
		await page.waitForLoadState('networkidle');
		// Wait for the game board container
		await expect(page.locator('.stage-container')).toBeVisible();
		// Wait for the Play button to ensure controls are loaded
		await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();

		await expect(page).toHaveScreenshot('game-level-1.png', { fullPage: true });
	});
});
