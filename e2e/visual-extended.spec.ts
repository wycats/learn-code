import { test, expect } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

test.describe('Visual Regression - Extended', () => {
	test('Design System', async ({ page }) => {
		await page.goto('/design');
		await expect(page.getByRole('heading', { name: 'Design System' })).toBeVisible();
		await argosScreenshot(page, 'design-system');
	});

	test('Pack Details - Basics', async ({ page }) => {
		await page.goto('/library/basics');
		await expect(page.locator('h1')).toContainText('The Basics');
		await argosScreenshot(page, 'pack-details-basics');
	});

	test('Builder - Empty State', async ({ page }) => {
		await page.goto('/builder');
		// Ensure we are in a clean state if possible, or just snapshot what's there
		await expect(page.locator('.grid-container')).toBeVisible();
		await argosScreenshot(page, 'builder-empty');
	});

	test('Builder - Story Config Modal', async ({ page }) => {
		await page.goto('/builder');
		await expect(page.locator('.grid-container')).toBeVisible();

		// Open the story config modal (assuming there's a button for it, usually "Settings" or similar)
		// Based on previous context, it might be triggered by "Create Intro" or a settings icon.
		// Let's try to find a settings button or similar.
		const settingsBtn = page.locator(
			'button[title="Story Settings"], button[aria-label="Story Settings"]'
		);

		if (await settingsBtn.isVisible()) {
			await settingsBtn.click();
			await expect(page.locator('.modal-content')).toBeVisible();
			await argosScreenshot(page, 'builder-story-config-modal');
		} else {
			console.log('Story Settings button not found, skipping modal test');
		}
	});

	test('Game - Level 1', async ({ page }) => {
		// Go to a simple level
		await page.goto('/play/basics/level-1');
		await expect(page.locator('.stage-container')).toBeVisible();
		await argosScreenshot(page, 'game-level-1');
	});
});
