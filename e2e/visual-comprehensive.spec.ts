import { test, expect, type Page } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

// Helper to force a specific theme
async function setTheme(page: Page, theme: 'light' | 'dark') {
	await page.evaluate((t: string) => {
		document.documentElement.setAttribute('data-theme', t);
	}, theme);
	// Wait a bit for transitions if any (though we should disable them ideally)
	await page.waitForTimeout(100);
}

// Helper to disable animations
async function disableAnimations(page: Page) {
	await page.addStyleTag({
		content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `
	});
}

test.describe('Comprehensive Visual Regression', () => {
	test.beforeEach(async ({ page }) => {
		await disableAnimations(page);
	});

	test('Home Screen', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible(); // Wait for load

		// Light Mode
		await setTheme(page, 'light');
		await argosScreenshot(page, 'home-light');

		// Dark Mode
		await setTheme(page, 'dark');
		await argosScreenshot(page, 'home-dark');
	});

	test('Library Screen', async ({ page }) => {
		await page.goto('/library');
		await expect(page.getByText('Code Climber')).toBeVisible();

		await setTheme(page, 'light');
		await argosScreenshot(page, 'library-light');

		await setTheme(page, 'dark');
		await argosScreenshot(page, 'library-dark');
	});

	test('Pack Details (Basics)', async ({ page }) => {
		await page.goto('/library/basics');
		await expect(page.getByText('The Basics')).toBeVisible();

		await setTheme(page, 'light');
		await argosScreenshot(page, 'pack-basics-light');

		await setTheme(page, 'dark');
		await argosScreenshot(page, 'pack-basics-dark');
	});

	test('Game Interface (Level 1)', async ({ page }) => {
		await page.goto('/play/basics/level-1');
		// Wait for critical elements
		await expect(page.locator('.stage-container')).toBeVisible();
		await expect(page.locator('.tray-area')).toBeVisible();

		// Ensure the instruction bar is visible
		await expect(page.getByText("Hi! I'm Zoey.")).toBeVisible();

		await setTheme(page, 'light');
		await argosScreenshot(page, 'game-level-1-light');

		await setTheme(page, 'dark');
		await argosScreenshot(page, 'game-level-1-dark');
	});

	test('Builder Interface (New Level)', async ({ page }) => {
		await page.goto('/builder');
		// Wait for load
		await expect(page.locator('.grid-container')).toBeVisible();

		await setTheme(page, 'light');
		await argosScreenshot(page, 'builder-new-light');

		await setTheme(page, 'dark');
		await argosScreenshot(page, 'builder-new-dark');
	});

	test('Builder - Story Editor', async ({ page }) => {
		await page.goto('/builder');
		await expect(page.locator('.grid-container')).toBeVisible();

		// The Story Bar is always visible at the top.
		// It starts with an empty state.
		await expect(page.getByText('Start your story by adding an intro segment.')).toBeVisible();

		// Click "Create Intro"
		await page.getByRole('button', { name: 'Create Intro' }).click();

		// Expect the editor to appear
		await expect(page.getByPlaceholder('Enter dialogue...')).toBeVisible();

		await setTheme(page, 'light');
		await argosScreenshot(page, 'builder-story-light');
	});
});
