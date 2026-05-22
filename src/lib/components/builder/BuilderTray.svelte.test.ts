import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import BuilderTray from './BuilderTray.svelte';
import type { BuilderModel } from '$lib/game/builder-model.svelte';
import { LOCKED_DOOR_TILE_ID, createLockedDoorTileDefinition } from '$lib/game/builder-presets';

function createBuilder() {
	const builder = $state({
		activeTool: { type: 'terrain', value: 'wall' } as const
	});
	const level = {
		id: 'level-1',
		name: 'Level 1',
		gridSize: { width: 5, height: 5 },
		start: { x: 0, y: 0 },
		startOrientation: 'E',
		goal: { x: 4, y: 4 },
		layout: {},
		items: {},
		customTiles: {
			[LOCKED_DOOR_TILE_ID]: createLockedDoorTileDefinition()
		},
		customItems: {},
		availableBlocks: {},
		functions: {}
	};

	return {
		pack: {
			id: 'test-pack',
			name: 'Test Pack',
			levels: [level],
			customTiles: {},
			customItems: {}
		},
		level,
		get activeTool() {
			return builder.activeTool;
		},
		set activeTool(tool) {
			builder.activeTool = tool;
		},
		selectedActor: null,
		targetingState: {
			isActive: false,
			onToggle: () => {}
		},
		game: {
			previewHighlight: undefined
		},
		pushState: () => {},
		syncGame: () => {}
	} as unknown as BuilderModel;
}

describe('BuilderTray', () => {
	it('exposes Jonas key-door tools without duplicating the persisted door definition', async () => {
		const builder = createBuilder();

		render(BuilderTray, { builder });

		await expect.element(page.getByText('Door')).toBeInTheDocument();
		await expect.element(page.getByText('Key')).toBeInTheDocument();
		await expect.element(page.getByText('Boat')).toBeInTheDocument();
		await expect.element(page.getByText('Erase')).toBeInTheDocument();
		expect(document.querySelectorAll('.tool-label')).toHaveLength(13);

		await page.getByRole('button', { name: 'Erase', exact: true }).click();
		expect(builder.activeTool).toEqual({ type: 'erase' });

		await page.getByRole('button', { name: 'Key', exact: true }).click();
		expect(builder.activeTool).toEqual({ type: 'item', value: 'key' });

		await page.getByRole('button', { name: 'Door', exact: true }).click();
		expect(builder.activeTool).toEqual({ type: 'terrain', value: LOCKED_DOOR_TILE_ID });
	});

	it('keeps tablet-width terrain tools consistently sized and aligned', async () => {
		const builder = createBuilder();

		render(BuilderTray, { builder });

		const toolMetrics = ['Erase', 'Wall', 'Door', 'Key'].map((label) => {
			const button = Array.from(document.querySelectorAll('.tool-btn')).find(
				(element) => element.textContent?.trim() === label
			) as HTMLElement | undefined;
			const buttonRect = button?.getBoundingClientRect();
			const previewRect = button?.querySelector('.cell-preview')?.getBoundingClientRect();
			return {
				label,
				width: Math.round(buttonRect?.width ?? 0),
				height: Math.round(buttonRect?.height ?? 0),
				previewWidth: Math.round(previewRect?.width ?? 0),
				previewHeight: Math.round(previewRect?.height ?? 0)
			};
		});

		expect(toolMetrics).toHaveLength(4);
		expect(new Set(toolMetrics.map((metric) => metric.previewWidth))).toEqual(new Set([54]));
		expect(new Set(toolMetrics.map((metric) => metric.previewHeight))).toEqual(new Set([54]));

		const labels = Array.from(document.querySelectorAll('.tool-label')) as HTMLElement[];
		const smallestLabelSize = Math.min(
			...labels.map((label) => Number.parseFloat(getComputedStyle(label).fontSize))
		);
		expect(smallestLabelSize).toBeGreaterThanOrEqual(16);
	});
});
