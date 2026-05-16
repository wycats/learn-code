import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Tray from './Tray.svelte';
import type { GameModel } from '$lib/game/model.svelte';

// Mock dependencies
vi.mock('$lib/interactions/dnd', () => ({
	draggableSource: vi.fn(() => ({ destroy: vi.fn() })),
	dropTarget: vi.fn(() => ({ destroy: vi.fn() }))
}));

vi.mock('$lib/actions/dnd', () => ({
	draggableVariable: vi.fn(() => ({ destroy: vi.fn() })),
	dropTargetForVariable: vi.fn(() => ({ destroy: vi.fn() }))
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
	monitorForElements: vi.fn(() => vi.fn())
}));

vi.mock('$lib/game/sound', () => ({
	soundManager: {
		play: vi.fn()
	}
}));

vi.mock('$lib/game/utils', () => ({
	resolveItemDefinition: vi.fn((level, type) => {
		if (type === 'boat') return { behavior: 'vehicle' };
		if (type === 'key') return { behavior: 'collectible' };
		return undefined;
	})
}));

// Mock GameModel
const createMockGame = (items = {}, availableBlocks = {}) =>
	({
		level: {
			availableBlocks: {
				'move-forward': 'unlimited',
				...availableBlocks
			},
			maxBlocks: 10,
			items
		},
		program: [],
		activeProgram: [],
		functions: {},
		blockCount: 0,
		status: 'planning',
		editingContext: null,
		loopProgress: new Map(),
		executionState: new Map(),
		previewHighlight: null
	}) as unknown as GameModel;

describe('Tray Variables', () => {
	it('shows Held Item when pick-up block is available', async () => {
		const game = createMockGame({}, { 'pick-up': 1 });
		const { getByText } = render(Tray, { game });
		expect(getByText('Held Item')).toBeInTheDocument();
	});

	it('shows Held Item when collectible item (key) is present', async () => {
		const game = createMockGame({ '1,1': { type: 'key' } }, {});
		const { getByText } = render(Tray, { game });
		expect(getByText('Held Item')).toBeInTheDocument();
	});

	it('hides Held Item when only vehicle (boat) is present', async () => {
		const game = createMockGame({ '1,1': { type: 'boat' } }, {});
		const { container } = render(Tray, { game });
		// Check that "Held Item" is NOT in the text content
		const heldItem = Array.from(container.querySelectorAll('*')).find(
			(el) => el.textContent === 'Held Item'
		);
		expect(heldItem).toBeUndefined();
	});

	it('hides Held Item when no items and no pick-up block', async () => {
		const game = createMockGame({}, {});
		const { container } = render(Tray, { game });
		const heldItem = Array.from(container.querySelectorAll('*')).find(
			(el) => el.textContent === 'Held Item'
		);
		expect(heldItem).toBeUndefined();
	});
});
