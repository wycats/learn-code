import { test, expect } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

test.describe('Builder Targets', () => {
	test('should show edit and clear buttons on target badge', async ({ page }) => {
		await page.goto('/builder');

		// Wait for builder to load
		await expect(page.locator('.grid-container')).toBeVisible();
		await expect(page.getByTestId('builder-mode-indicator')).toHaveAttribute('data-mode', 'edit');
		await expect(page.getByTestId('builder-current-level-indicator')).toContainText('New Level');

		await page.getByRole('button', { name: 'Level Settings' }).click();
		await expect(page.getByTestId('builder-mode-indicator')).toHaveAttribute(
			'data-mode',
			'settings'
		);
		await expect(page.getByTestId('builder-settings-mode-indicator')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('builder-mode-indicator')).toHaveAttribute('data-mode', 'edit');

		// Check if we need to create an intro segment
		const createIntroBtn = page.locator('button:has-text("Create Intro")');
		if (await createIntroBtn.isVisible()) {
			await createIntroBtn.click();
		}

		// Wait for the story bar to show the editor (not the empty state)
		const storyEditor = page.locator('.instruction-bar-editor:not(.empty-state)');
		const storyModeIndicator = storyEditor.locator('[data-testid="builder-story-mode-indicator"]');
		await expect(storyEditor).toBeVisible();
		await expect(storyModeIndicator).toContainText('Story Editing');

		// Click the target button (Edit Targets)
		// It might be the initial target button if no targets exist
		const targetBtn = page.locator('button[title="Edit Targets"]');
		await targetBtn.click();

		// We should be in targeting mode now
		await expect(page.locator('.targeting-controls')).toBeVisible();
		await expect(page.getByTestId('builder-mode-indicator')).toHaveAttribute(
			'data-mode',
			'targeting'
		);
		await expect(storyModeIndicator).toContainText('Targeting 0');

		// Select a grid cell (1,0) - using second cell wrapper to avoid character at (0,0)
		const cell = page.locator('.grid-cell-wrapper').nth(1);
		await cell.click();
		await expect(storyModeIndicator).toContainText('Targeting 1');

		// Confirm selection
		const confirmBtn = page.locator('button[title="Done Selecting"]');
		await confirmBtn.click();
		await expect(page.getByTestId('builder-mode-indicator')).toHaveAttribute('data-mode', 'edit');

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
		await argosScreenshot(page, 'story-bar-with-targets', { element: storyBar });
	});

	test('should show test mode indicators when playing from builder', async ({ page }) => {
		await page.goto('/builder');
		await expect(page.locator('.grid-container')).toBeVisible();

		await page.getByRole('button', { name: 'Play Level' }).click();

		await expect(page.getByTestId('builder-test-mode-indicator')).toBeVisible();
		await expect(page.getByTestId('player-mode-indicator')).toHaveAttribute('data-mode', 'goal');
		await expect(page.getByRole('button', { name: 'Exit Test' })).toBeVisible();
	});
});
