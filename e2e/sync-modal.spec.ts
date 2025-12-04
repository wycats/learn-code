import { test, expect } from '@playwright/test';

test.describe('Sync Modal', () => {
	test('should open sync modal from home page', async ({ page }) => {
		await page.goto('/');

		// Click Sync Devices button
		await page.getByRole('button', { name: 'Sync Devices' }).click();

		// Check if modal is visible
		// P2PModal usually has a "Host" or "Join" toggle, or at least some text indicating P2P
		// Let's look for the "Sync" or "Connection" related text if we don't know the exact P2PModal structure
		// But we know P2PModal has tabs for "Host" and "Join" usually.

		// Let's check for the dialog element
		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible();

		// Check for Host/Join tabs or buttons
		await expect(page.getByRole('button', { name: 'Send Data' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Receive Data' })).toBeVisible();

		// Close modal
		await page.getByRole('button', { name: 'Close' }).click();
		await expect(dialog).not.toBeVisible();
	});
});
