import { test, expect, type Page } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

// Helper to force a specific theme
async function setTheme(page: Page, theme: 'light' | 'dark') {
	await page.evaluate((t: string) => {
		document.documentElement.setAttribute('data-theme', t);
	}, theme);
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

// Helper to advance story if present
async function advanceStory(page: Page) {
	const overlay = page.locator('.disabled-overlay');
	const nextBtn = page.locator('.next-btn');

	// 1. Handle Story Mode (Overlay with text)
	const startTime = Date.now();
	while ((await overlay.isVisible()) && Date.now() - startTime < 10000) {
		// If we are in story mode, the overlay has text
		const storyText = overlay.locator('span', { hasText: 'Listen to the Guide...' });
		if (await storyText.isVisible()) {
			if (await nextBtn.isVisible()) {
				await nextBtn.click();
				await page.waitForTimeout(500); // Wait for transition
			} else {
				await page.waitForTimeout(200);
			}
		} else {
			// Overlay is visible but not showing story text (likely Goal mode)
			break;
		}
	}

	// 2. Handle Goal Modal (which appears after story)
	const goalModal = page.locator('.goal-modal');
	if (await goalModal.isVisible()) {
		const startBtn = goalModal.locator('button', { hasText: 'Start Planning' });
		await startBtn.click();
		await expect(goalModal).not.toBeVisible();
	}

	// 3. Ensure overlay is gone
	await expect(overlay).not.toBeVisible();
}

test.describe('Visual Regression', () => {
	test.beforeEach(async ({ page }) => {
		await disableAnimations(page);
	});

	test('Home Screen', async ({ page }) => {
		await page.goto('/');
		await setTheme(page, 'light');
		await argosScreenshot(page, 'home-screen-light');
		await setTheme(page, 'dark');
		await argosScreenshot(page, 'home-screen-dark');
	});

	test('Library Screen', async ({ page }) => {
		await page.goto('/library');
		await expect(page.locator('h1')).toContainText('Code Climber');
		await setTheme(page, 'light');
		await argosScreenshot(page, 'library-screen-light');
	});

	test('Game - Win State', async ({ page }) => {
		// Go to Level 1 (Basics)
		await page.goto('/play/basics/level-1');
		await expect(page.locator('.stage-container')).toBeVisible();

		// Advance story if needed
		await advanceStory(page);

		// Add 4 "Move Forward" blocks to reach the goal (distance is 4)
		const moveBlock = page.locator('.block-list .block[data-type="move-forward"]');
		await expect(moveBlock).toBeVisible();
		for (let i = 0; i < 4; i++) {
			await moveBlock.click();
			// Small wait to ensure order (though click should be sequential)
			await page.waitForTimeout(50);
		}

		// Verify we have 4 blocks
		const programList = page.locator('.program-list');
		await expect(programList.locator('.block[data-type="move-forward"]')).toHaveCount(4);

		// Click Play
		const playButton = page.locator('button[aria-label="Play"]');
		await playButton.click();

		// Wait for the Win Modal
		const winModal = page.locator('.win-modal');
		await expect(winModal).toBeVisible();

		// Screenshot
		await setTheme(page, 'light');
		await argosScreenshot(page, 'game-win-light');

		await setTheme(page, 'dark');
		await argosScreenshot(page, 'game-win-dark');
	});

	test('Game - Failure State', async ({ page }) => {
		// Go to Level 1
		await page.goto('/play/basics/level-1');
		await expect(page.locator('.stage-container')).toBeVisible();

		// Advance story if needed
		await advanceStory(page);

		// Move Forward x 3 (to 3,2), Turn Left (face N), Move Forward (to 3,1 - Wall)
		const moveBlock = page.locator('.block-list .block[data-type="move-forward"]');
		const turnLeftBlock = page.locator('.block-list .block[data-type="turn-left"]');

		await moveBlock.click();
		await moveBlock.click();
		await moveBlock.click();
		await turnLeftBlock.click();
		await moveBlock.click();

		// Click Play
		const playButton = page.locator('button[aria-label="Play"]');
		await playButton.click();

		// Wait for the last block to be marked as blocked
		const lastBlock = page.locator('.program-list .block').last();
		await expect(lastBlock).toHaveClass(/blocked/, { timeout: 5000 });

		// Screenshot
		await setTheme(page, 'light');
		await argosScreenshot(page, 'game-fail-light');
	});

	test('Builder - Interaction', async ({ page }) => {
		await page.goto('/builder');
		await expect(page.locator('.grid-container')).toBeVisible();

		// Place a wall
		// Click the 3rd cell to avoid the character at (0,0)
		const gridCell = page.locator('.grid-cell-wrapper').nth(2);
		await gridCell.click();

		// Wait for the cell to update
		await page.waitForTimeout(200);

		// Screenshot with a wall placed
		await setTheme(page, 'light');
		await argosScreenshot(page, 'builder-with-wall-light');
	});
});
