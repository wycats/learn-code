import { test } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Visual Verification Test
 *
 * This test is designed to be modified by the Agent to capture specific states.
 * It navigates to a URL, performs optional actions, and then captures:
 * 1. A screenshot (visual-check.png)
 * 2. A DOM snapshot (visual-check.html)
 * 3. An Accessibility tree snapshot (visual-check-a11y.json)
 */

test('Visual Verification', async ({ page }) => {
	// --- AGENT: CONFIGURE HERE ---
	const url = '/'; // The URL to visit

	// Optional: Actions to perform before capture
	// await page.goto(url);
	// await page.getByRole('button', { name: 'Play' }).click();
	// -----------------------------

	await page.goto(url);

	// Wait for network idle to ensure assets are loaded
	await page.waitForLoadState('networkidle');

	// Create output directory
	const outputDir = 'test-results/visual-check';
	await fs.mkdir(outputDir, { recursive: true });

	// 1. Capture Screenshot
	await page.screenshot({ path: path.join(outputDir, 'screenshot.png'), fullPage: true });

	// 2. Capture DOM Snapshot (for Agent analysis)
	const html = await page.content();
	await fs.writeFile(path.join(outputDir, 'snapshot.html'), html);

	// 3. Capture Accessibility Tree (for Agent analysis of structure)
	if (page.accessibility) {
		const snapshot = await page.accessibility.snapshot();
		await fs.writeFile(path.join(outputDir, 'a11y.json'), JSON.stringify(snapshot, null, 2));
	} else {
		console.warn('page.accessibility is undefined. Skipping accessibility snapshot.');
	}

	console.log(`Visual check complete. Artifacts saved to ${outputDir}`);
});
