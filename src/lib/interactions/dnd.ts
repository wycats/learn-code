import {
	draggable,
	dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
	attachClosestEdge,
	extractClosestEdge
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { interactionManager } from './manager.svelte';

export function draggableSource(
	node: HTMLElement,
	params: { id: string; data?: Record<string, unknown>; disabled?: boolean }
) {
	let cleanup: () => void;

	function setup(currentParams: typeof params) {
		cleanup = draggable({
			element: node,
			canDrag: () => !currentParams.disabled,
			getInitialData: () => ({ id: currentParams.id, ...currentParams.data }),
			onDragStart: () => {
				interactionManager.startSession(currentParams.id, 'drag');
			},
			onDrop: () => {
				interactionManager.endSession();
			}
		});
	}

	setup(params);

	return {
		update(newParams: typeof params) {
			cleanup();
			setup(newParams);
		},
		destroy: () => cleanup()
	};
}

export function dropTarget(
	node: HTMLElement,
	params: { id: string; data?: Record<string, unknown> }
) {
	const cleanup = dropTargetForElements({
		element: node,
		getData: ({ input, element }) => {
			const data = { id: params.id, ...params.data };
			return attachClosestEdge(data, { input, element, allowedEdges: ['top', 'bottom'] });
		},
		canDrop: () => {
			// Only allow drop if this target is a candidate in the current session
			if (!interactionManager.session) return false;
			return interactionManager.session.candidates.some((c) => c.id === params.id);
		},
		onDragEnter: ({ self }) => {
			if (interactionManager.session) {
				const edge = extractClosestEdge(self.data) as 'top' | 'bottom' | null;
				interactionManager.session.hover(params.id, edge);
			}
		},
		onDrag: ({ self }) => {
			if (interactionManager.session) {
				const edge = extractClosestEdge(self.data) as 'top' | 'bottom' | null;
				interactionManager.session.hover(params.id, edge);
			}
		},
		onDragLeave: () => {
			if (interactionManager.session && interactionManager.session.activeTargetId === params.id) {
				interactionManager.session.hover(null);
			}
		},
		onDrop: () => {
			if (interactionManager.session) {
				interactionManager.session.commit();
				// Session end is handled by source onDrop or explicit call?
				// Usually better to end it here if successful.
				interactionManager.endSession();
			}
		}
	});

	return {
		destroy: cleanup
	};
}
