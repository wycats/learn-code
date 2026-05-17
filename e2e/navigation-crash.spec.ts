import { test, expect } from '@playwright/test';

test('navigation home -> builder -> home should not crash', async ({ page }) => {
	// Go to home
	await page.goto('/');
	await expect(page.getByText('Kibi')).toBeVisible();

	// Go to Builder Mode
	await page.getByRole('button', { name: 'Builder Mode' }).click();
	await expect(page.getByRole('heading', { name: "Architect's Library" })).toBeVisible();

	// Go Back
	await page.getByRole('button', { name: 'Back to Main Menu' }).click();
	await expect(page.getByText('Kibi')).toBeVisible();
});
