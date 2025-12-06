import { describe, it, expect, vi, beforeEach } from 'vitest';
import { draggableSource, dropTarget } from './dnd';
import { interactionManager } from './manager.svelte';
import * as adapter from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

// Mock dependencies
vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
	draggable: vi.fn(() => vi.fn()),
	dropTargetForElements: vi.fn(() => vi.fn())
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge', () => ({
	attachClosestEdge: vi.fn((data) => data),
	extractClosestEdge: vi.fn(() => 'top')
}));

vi.mock('./manager.svelte', () => ({
	interactionManager: {
		startSession: vi.fn(),
		endSession: vi.fn(),
		session: null
	}
}));

type MockSession = {
	candidates?: { id: string }[];
	hover?: ReturnType<typeof vi.fn>;
	commit?: ReturnType<typeof vi.fn>;
	activeTargetId?: string;
};

type MockInteractionManager = {
	startSession: ReturnType<typeof vi.fn>;
	endSession: ReturnType<typeof vi.fn>;
	session: MockSession | null;
};

describe('Drag and Drop Primitives', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = document.createElement('div');
		vi.clearAllMocks();
		// Reset session mock
		(interactionManager as unknown as MockInteractionManager).session = null;
	});

	describe('draggableSource', () => {
		it('initializes draggable adapter', () => {
			draggableSource(element, { id: 'source-1' });
			expect(adapter.draggable).toHaveBeenCalledWith(
				expect.objectContaining({
					element: element
				})
			);
		});

		it('starts session on drag start', () => {
			draggableSource(element, { id: 'source-1' });
			const config = vi.mocked(adapter.draggable).mock.calls[0][0];

			// @ts-expect-error - Mocking event data
			config.onDragStart?.({});
			expect(interactionManager.startSession).toHaveBeenCalledWith('source-1', 'drag');
		});

		it('ends session on drop', () => {
			draggableSource(element, { id: 'source-1' });
			const config = vi.mocked(adapter.draggable).mock.calls[0][0];

			// @ts-expect-error - Mocking event data
			config.onDrop?.({});
			expect(interactionManager.endSession).toHaveBeenCalled();
		});

		it('cleans up on destroy', () => {
			const cleanup = vi.fn();
			vi.mocked(adapter.draggable).mockReturnValue(cleanup);

			const action = draggableSource(element, { id: 'source-1' });
			action.destroy();

			expect(cleanup).toHaveBeenCalled();
		});

		it('updates configuration', () => {
			const cleanup = vi.fn();
			vi.mocked(adapter.draggable).mockReturnValue(cleanup);

			const action = draggableSource(element, { id: 'source-1' });
			action.update({ id: 'source-2' });

			expect(cleanup).toHaveBeenCalled();
			expect(adapter.draggable).toHaveBeenCalledTimes(2);

			// Check if new config uses new ID
			const newConfig = vi.mocked(adapter.draggable).mock.calls[1][0];
			// @ts-expect-error - Mocking event data
			const data = newConfig.getInitialData?.({});
			expect(data).toEqual({ id: 'source-2' });
		});
	});

	describe('dropTarget', () => {
		it('initializes dropTarget adapter', () => {
			dropTarget(element, { id: 'target-1' });
			expect(adapter.dropTargetForElements).toHaveBeenCalledWith(
				expect.objectContaining({
					element: element
				})
			);
		});

		it('checks candidates for canDrop', () => {
			dropTarget(element, { id: 'target-1' });
			const config = vi.mocked(adapter.dropTargetForElements).mock.calls[0][0];

			// No session
			// @ts-expect-error - Mocking event data
			expect(config.canDrop?.({})).toBe(false);

			// Session with matching candidate
			(interactionManager as unknown as MockInteractionManager).session = {
				candidates: [{ id: 'target-1' }]
			};
			// @ts-expect-error - Mocking event data
			expect(config.canDrop?.({})).toBe(true);

			// Session without matching candidate
			(interactionManager as unknown as MockInteractionManager).session = {
				candidates: [{ id: 'other' }]
			};
			// @ts-expect-error - Mocking event data
			expect(config.canDrop?.({})).toBe(false);
		});

		it('hovers on drag enter/drag', () => {
			dropTarget(element, { id: 'target-1' });
			const config = vi.mocked(adapter.dropTargetForElements).mock.calls[0][0];

			const mockSession = {
				hover: vi.fn(),
				candidates: [{ id: 'target-1' }]
			};
			(interactionManager as unknown as MockInteractionManager).session = mockSession;

			// @ts-expect-error - Mocking event data
			config.onDragEnter?.({ self: { data: {} } });
			expect(mockSession.hover).toHaveBeenCalledWith('target-1', 'top');

			// @ts-expect-error - Mocking event data
			config.onDrag?.({ self: { data: {} } });
			expect(mockSession.hover).toHaveBeenCalledWith('target-1', 'top');
		});

		it('clears hover on drag leave', () => {
			dropTarget(element, { id: 'target-1' });
			const config = vi.mocked(adapter.dropTargetForElements).mock.calls[0][0];

			const mockSession = {
				hover: vi.fn(),
				activeTargetId: 'target-1'
			};
			(interactionManager as unknown as MockInteractionManager).session = mockSession;

			// @ts-expect-error - Mocking event data
			config.onDragLeave?.({});
			expect(mockSession.hover).toHaveBeenCalledWith(null);
		});

		it('commits on drop', () => {
			dropTarget(element, { id: 'target-1' });
			const config = vi.mocked(adapter.dropTargetForElements).mock.calls[0][0];

			const mockSession = {
				commit: vi.fn(),
				candidates: [{ id: 'target-1' }]
			};
			(interactionManager as unknown as MockInteractionManager).session = mockSession;

			// @ts-expect-error - Mocking event data
			config.onDrop?.({});
			expect(mockSession.commit).toHaveBeenCalled();
			expect(interactionManager.endSession).toHaveBeenCalled();
		});
	});
});
