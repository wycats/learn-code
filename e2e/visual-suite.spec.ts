import { test, expect } from '@playwright/test';

test.describe('Visual Regression Suite', () => {
	test.use({ colorScheme: 'light' });

	test('Home Page', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveScreenshot('home-page.png', { fullPage: true });
	});

	test('Library (Packs)', async ({ page }) => {
		await page.goto('/library');
		await page.waitForLoadState('networkidle');
		await expect(page.getByRole('heading', { name: 'The Basics' })).toBeVisible();
		await expect(page).toHaveScreenshot('library-page.png', { fullPage: true });
	});

	test('Builder (New Level)', async ({ page }) => {
		await page.goto('/builder');
		await page.waitForLoadState('networkidle');
		await expect(page.locator('.grid-stage')).toBeVisible();
		await expect(page).toHaveScreenshot('builder-new.png', { fullPage: true });
	});

	test('Game (Level 1)', async ({ page }) => {
		await page.goto('/play/basics/level-1');
		await page.waitForLoadState('networkidle');
		await expect(page.locator('.stage-container')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
		await expect(page).toHaveScreenshot('game-level-1.png', { fullPage: true });
	});

	test('Modals', async ({ page }) => {
		await page.goto('/builder');
		await page.waitForLoadState('networkidle');

		// Share Modal
		await page.getByRole('button', { name: 'Share Level' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.locator('.qr-container img')).toBeVisible();
		await expect(page).toHaveScreenshot('modal-share.png', {
			mask: [page.locator('.qr-container img'), page.locator('input[readonly]')],
			maxDiffPixelRatio: 0.1
		});
		await page.keyboard.press('Escape');

		// Settings Modal (Level Settings)
		await page.getByRole('button', { name: 'Level Settings' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page).toHaveScreenshot('modal-settings.png');
	});
});

test.describe('Dark Mode Visuals', () => {
	test.use({ colorScheme: 'dark' });

	test('Home Page (Dark)', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveScreenshot('home-page-dark.png', { fullPage: true });
	});

	test('Builder (Dark)', async ({ page }) => {
		await page.goto('/builder');
		await page.waitForLoadState('networkidle');
		await expect(page.locator('.grid-stage')).toBeVisible();
		await expect(page).toHaveScreenshot('builder-dark.png', { fullPage: true });
	});

	test('Game (Dark)', async ({ page }) => {
		await page.goto('/play/basics/level-1');
		await page.waitForLoadState('networkidle');
		await expect(page.locator('.stage-container')).toBeVisible();
		await expect(page).toHaveScreenshot('game-dark.png', { fullPage: true });
	});
});
