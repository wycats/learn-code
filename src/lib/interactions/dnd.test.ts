// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { draggableSource, dropTarget } from './dnd';
import { interactionManager } from './manager.svelte';

// Mock the external dependencies
vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
	draggable: vi.fn(() => vi.fn()),
	dropTargetForElements: vi.fn(() => vi.fn())
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge', () => ({
	attachClosestEdge: vi.fn((data) => data),
	extractClosestEdge: vi.fn(() => 'top')
}));

// Mock the interaction manager
vi.mock('./manager.svelte', () => ({
	interactionManager: {
		startSession: vi.fn(),
		endSession: vi.fn(),
		session: null
	}
}));

import {
	draggable,
	dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

describe('Drag and Drop Adapters', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = document.createElement('div');
		vi.clearAllMocks();
	});

	describe('draggableSource', () => {
		it('should initialize draggable adapter', () => {
			const params = { id: 'test-id', data: { foo: 'bar' } };
			draggableSource(element, params);

			expect(draggable).toHaveBeenCalledWith(
				expect.objectContaining({
					element: element,
					canDrag: expect.any(Function),
					getInitialData: expect.any(Function),
					onDragStart: expect.any(Function),
					onDrop: expect.any(Function)
				})
			);
		});

		it('should handle updates by cleaning up and re-initializing', () => {
			const cleanupMock = vi.fn();
			vi.mocked(draggable).mockReturnValue(cleanupMock);

			const action = draggableSource(element, { id: '1' });
			expect(draggable).toHaveBeenCalledTimes(1);

			action.update({ id: '2' });
			expect(cleanupMock).toHaveBeenCalled();
			expect(draggable).toHaveBeenCalledTimes(2);
		});

		it('should call interactionManager.startSession on drag start', () => {
			let onDragStartCallback: () => void;
			vi.mocked(draggable).mockImplementation((config) => {
				onDragStartCallback = config.onDragStart as () => void;
				return vi.fn();
			});

			draggableSource(element, { id: 'test-id' });

			// Trigger the callback
			onDragStartCallback!();

			expect(interactionManager.startSession).toHaveBeenCalledWith('test-id', 'drag');
		});

		it('should call interactionManager.endSession on drop', () => {
			let onDropCallback: () => void;
			vi.mocked(draggable).mockImplementation((config) => {
				onDropCallback = config.onDrop as () => void;
				return vi.fn();
			});

			draggableSource(element, { id: 'test-id' });

			// Trigger the callback
			onDropCallback!();

			expect(interactionManager.endSession).toHaveBeenCalled();
		});
	});

	describe('dropTarget', () => {
		it('should initialize dropTarget adapter', () => {
			const params = { id: 'target-id' };
			dropTarget(element, params);

			expect(dropTargetForElements).toHaveBeenCalledWith(
				expect.objectContaining({
					element: element,
					getData: expect.any(Function),
					canDrop: expect.any(Function),
					onDragEnter: expect.any(Function),
					onDrag: expect.any(Function),
					onDragLeave: expect.any(Function),
					onDrop: expect.any(Function)
				})
			);
		});

		it('should check interactionManager session for canDrop', () => {
			let canDropCallback: () => boolean;
			vi.mocked(dropTargetForElements).mockImplementation((config) => {
				canDropCallback = config.canDrop as () => boolean;
				return vi.fn();
			});

			dropTarget(element, { id: 'target-id' });

			// Case 1: No session
			// Testing private state
			interactionManager.session = null;
			expect(canDropCallback!()).toBe(false);

			// Case 2: Session exists but target not in candidates
			// @ts-expect-error - Testing private state
			interactionManager.session = { candidates: [{ id: 'other-id' }] };
			expect(canDropCallback!()).toBe(false);

			// Case 3: Session exists and target is candidate
			// @ts-expect-error - Testing private state
			interactionManager.session = { candidates: [{ id: 'target-id' }] };
			expect(canDropCallback!()).toBe(true);
		});

		it('should update hover state on drag enter/move', () => {
			let onDragEnterCallback: (args: unknown) => void;
			vi.mocked(dropTargetForElements).mockImplementation((config) => {
				onDragEnterCallback = config.onDragEnter as (args: unknown) => void;
				return vi.fn();
			});

			dropTarget(element, { id: 'target-id' });

			const mockHover = vi.fn();
			// @ts-expect-error - Testing private state
			interactionManager.session = { hover: mockHover };

			onDragEnterCallback!({ self: { data: {} } });

			expect(mockHover).toHaveBeenCalledWith('target-id', 'top'); // 'top' comes from mocked extractClosestEdge
		});

		it('should commit session on drop', () => {
			let onDropCallback: () => void;
			vi.mocked(dropTargetForElements).mockImplementation((config) => {
				onDropCallback = config.onDrop as () => void;
				return vi.fn();
			});

			dropTarget(element, { id: 'target-id' });

			const mockCommit = vi.fn();
			// @ts-expect-error - Testing private state
			interactionManager.session = { commit: mockCommit };

			onDropCallback!();

			expect(mockCommit).toHaveBeenCalled();
			expect(interactionManager.endSession).toHaveBeenCalled();
		});
	});
});
