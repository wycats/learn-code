import { test, expect } from '@playwright/test';

test.describe('Builder Targets', () => {
	test('should show edit and clear buttons on target badge', async ({ page }) => {
		await page.goto('/builder');

		// Wait for builder to load
		await expect(page.locator('.grid-container')).toBeVisible();

		// Check if we need to create an intro segment
		const createIntroBtn = page.locator('button:has-text("Create Intro")');
		if (await createIntroBtn.isVisible()) {
			await createIntroBtn.click();
		}

		// Wait for the story bar to show the editor (not the empty state)
		await expect(page.locator('.instruction-bar-editor:not(.empty-state)')).toBeVisible();

		// Click the target button (Edit Targets)
		// It might be the initial target button if no targets exist
		const targetBtn = page.locator('button[title="Edit Targets"]');
		await targetBtn.click();

		// We should be in targeting mode now
		await expect(page.locator('.targeting-controls')).toBeVisible();

		// Select a grid cell (1,0) - using second cell wrapper to avoid character at (0,0)
		const cell = page.locator('.grid-cell-wrapper').nth(1);
		await cell.click();

		// Confirm selection
		const confirmBtn = page.locator('button[title="Done Selecting"]');
		await confirmBtn.click();

		// Now we should see the badge
		const badge = page.locator('.highlight-badge');
		await expect(badge).toBeVisible();

		// Check for the corner buttons
		const clearBtn = badge.locator('.badge-corner-btn.clear');
		const editBtn = badge.locator('.badge-corner-btn.edit');

		await expect(clearBtn).toBeVisible();
		await expect(editBtn).toBeVisible();

		// Take a screenshot of the story bar to verify placement
		const storyBar = page.locator('.story-bar-container');
		await expect(storyBar).toHaveScreenshot('story-bar-with-targets.png');
	});
});
