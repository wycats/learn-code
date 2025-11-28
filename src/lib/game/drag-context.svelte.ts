import { getContext, setContext } from 'svelte';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

const DRAG_CTX_KEY = Symbol('DRAG_CTX');

export class DragContext {
	targetId = $state<string | null>(null);
	closestEdge = $state<Edge | null>(null);
	isDragging = $state(false);
}

export function setDragContext() {
	const ctx = new DragContext();
	setContext(DRAG_CTX_KEY, ctx);
	return ctx;
}

export function getDragContext() {
	return getContext<DragContext>(DRAG_CTX_KEY);
}
