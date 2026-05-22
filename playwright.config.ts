import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command:
			'DATABASE_URL=pglite:./.pglite-e2e pnpm run build && DATABASE_URL=pglite:./.pglite-e2e pnpm exec vite preview --host localhost --port 4173',
		url: 'http://localhost:4173/',
		timeout: 180_000,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'e2e',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		['html', { open: 'never' }],
		// Use Argos reporter when running in CI
		process.env.CI ? ['@argos-ci/playwright/reporter'] : ['line']
	],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: 'http://localhost:4173',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',

		// Capture screenshot on failure
		screenshot: 'only-on-failure'
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		/* Test against mobile viewports. */
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] }
		}
		// {
		// 	name: 'Mobile Safari',
		// 	use: { ...devices['iPhone 12'] },
		// },
	]
});
