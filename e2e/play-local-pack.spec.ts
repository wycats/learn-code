import { test, expect } from '@playwright/test';

test('should load a user-created pack in play mode', async ({ page }) => {
	// 1. Create Pack
	await page.goto('/builder/packs');
	await page.click('button:has-text("Create New Pack")');

	// Wait for navigation to pack editor
	await expect(page).toHaveURL(/\/builder\/packs\/.+/);

	// 2. Add Level
	// We need to find the "Add Level" button in the pack editor
	await page.click('button:has-text("Add Level")');

	// The level is added to the list, but we don't navigate automatically.
	// We should see "Level 1" in the list now.
	await expect(page.locator('text=Level 1')).toBeVisible();

	// 3. Go Home
	await page.goto('/');

	// 4. Start Coding
	await page.click('button:has-text("Start Coding")');

	// 5. Select Pack (it should be under "My Projects")
	// The pack name defaults to "New Adventure"
	await page.click('text=New Adventure');

	// 6. Select Level
	// The level name defaults to "Level 1" usually
	await page.click('text=Level 1');

	// 7. Assert Game Loaded
	// The game container should be visible
	await expect(page.locator('.play-container')).toBeVisible({ timeout: 10000 });
	await expect(page.locator('text=Loading...')).not.toBeVisible();
});
