import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	test('should show QR code by default', async ({ page }) => {
		await page.goto('/login');

		// Check for title
		await expect(page.getByRole('heading', { name: 'Connect Device' })).toBeVisible();

		// Check for QR Code
		await expect(page.getByRole('img', { name: 'Scan to login' })).toBeVisible();

		// Check for Parent Login link
		await expect(page.getByRole('button', { name: 'I am a Parent' })).toBeVisible();
	});

	test('should switch to parent login', async ({ page }) => {
		await page.goto('/login');

		// Click Parent Login
		await page.getByRole('button', { name: 'I am a Parent' }).click();

		// Should show OAuth buttons
		await expect(page.getByRole('heading', { name: 'Parent Login' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in with GitHub' })).toBeVisible();
	});
});
