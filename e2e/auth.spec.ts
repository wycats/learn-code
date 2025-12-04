import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	test('should show login options', async ({ page }) => {
		await page.goto('/login');

		// Check for title
		await expect(page.getByRole('heading', { name: 'Parent Login' })).toBeVisible();

		// Check for OAuth buttons
		await expect(page.getByRole('link', { name: 'Sign in with Google' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Sign in with GitHub' })).toBeVisible();

		// Check for QR Code button
		await expect(page.getByRole('button', { name: "Log in with Parent's Phone" })).toBeVisible();
	});

	test('should start QR handshake', async ({ page }) => {
		await page.goto('/login');

		// Click QR button
		await page.getByRole('button', { name: "Log in with Parent's Phone" }).click();

		// Should show QR code
		await expect(page.getByText("Scan with Parent's Phone")).toBeVisible();
		await expect(page.getByRole('img', { name: 'Scan to login' })).toBeVisible();
	});
});
