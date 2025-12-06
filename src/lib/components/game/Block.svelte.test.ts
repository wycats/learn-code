import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Block from './Block.svelte';
import { interactionManager } from '$lib/interactions/manager.svelte';
import type { Block as BlockType } from '$lib/game/types';

// Mock dnd actions to avoid complex browser drag simulation in this test
vi.mock('$lib/interactions/dnd', () => ({
	draggableSource: vi.fn(() => ({ destroy: vi.fn() })),
	dropTarget: vi.fn(() => ({ destroy: vi.fn() }))
}));

vi.mock('$lib/actions/dnd', () => ({
	dropTargetForVariable: vi.fn(() => ({ destroy: vi.fn() }))
}));

describe('Block Component', () => {
	const mockBlock: BlockType = {
		id: 'block-1',
		type: 'move-forward'
	};

	beforeEach(() => {
		// Reset interaction manager state
		interactionManager.clearSelection();
		if (interactionManager.session) {
			interactionManager.endSession();
		}
	});

	it('renders correctly', async () => {
		const { getByRole } = render(Block, { block: mockBlock });
		const element = getByRole('button');
		expect(element).toBeInTheDocument();
		expect(element).toHaveClass('block');
		expect(element).toHaveAttribute('data-type', 'move-forward');
	});

	it('registers with interaction manager', async () => {
		await render(Block, { block: mockBlock });

		// Check if node is registered in the registry
		// We can't access registry directly easily as it's private in manager,
		// but we can check if getComponentState returns valid state
		const state = interactionManager.getComponentState('block-1');
		expect(state).toBeDefined();
		expect(state.status).toBe('idle');
	});

	it('reflects selection state', async () => {
		const { getByRole } = render(Block, { block: mockBlock });

		interactionManager.select('block-1');

		const element = getByRole('button');
		await vi.waitFor(() => {
			expect(element).toHaveClass('selected');
		});
	});

	it('reflects ghost state', async () => {
		const ghostBlock: BlockType = { ...mockBlock, isGhost: true };
		const { getByRole } = render(Block, { block: ghostBlock });

		const element = getByRole('button');
		expect(element).toHaveClass('ghost');
	});

	it('renders children for loop block', async () => {
		const loopBlock: BlockType = {
			id: 'loop-1',
			type: 'loop',
			count: 3,
			children: [{ id: 'child-1', type: 'move-forward' }]
		};

		const { getByText, container } = render(Block, { block: loopBlock });

		expect(getByText('Repeat')).toBeInTheDocument();
		expect(getByText('3x')).toBeInTheDocument();

		// Check for child block
		// The child block will also have role="button"
		const buttons = container.querySelectorAll('[role="button"]');
		expect(buttons.length).toBeGreaterThan(1); // Loop block + child block
	});
});
