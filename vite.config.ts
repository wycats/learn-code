import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		devtoolsJson(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			thresholds: {
				global: {
					statements: 15,
					branches: 15,
					functions: 15,
					lines: 15
				},
				'src/lib/game/mimic.ts': {
					lines: 85,
					functions: 85,
					branches: 75
				},
				'src/lib/game/sound.ts': {
					lines: 95,
					functions: 90
				},
				'src/lib/game/model.svelte.ts': {
					lines: 80
				},
				'src/lib/interactions/dnd.ts': {
					lines: 85
				}
			},
			include: ['src/**/*.{js,ts,svelte}'],
			exclude: [
				'src/lib/paraglide/**',
				'src/**/*.d.ts',
				'src/stories/**',
				'src/**/*.json',
				'src/lib/game/levels/**'
			]
		}
	}
});
