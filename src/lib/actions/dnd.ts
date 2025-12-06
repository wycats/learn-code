import {
	draggable,
	dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { setDraggedBlock } from '$lib/game/drag.svelte';
import type { Block } from '$lib/game/types';

export interface DraggableOptions {
	block: Block;
	isPaletteItem?: boolean;
	disabled?: boolean;
}

export function draggableBlock(node: HTMLElement, options: DraggableOptions) {
	let cleanup = setup();

	function setup() {
		return draggable({
			element: node,
			canDrag: () => !options.disabled,
			getInitialData: () => ({
				type: 'block',
				block: options.block,
				isPaletteItem: options.isPaletteItem
			}),
			onDragStart: () => {
				setDraggedBlock(options.block);
				node.classList.add('dragging');
			},
			onDrop: () => {
				setDraggedBlock(null);
				node.classList.remove('dragging');
			}
		});
	}

	return {
		update(newOptions: DraggableOptions) {
			options = newOptions;
			cleanup();
			cleanup = setup();
		},
		destroy: () => cleanup()
	};
}

export interface DropTargetOptions {
	blockId?: string; // ID of the block this target belongs to (if nested)
	index?: number; // Index in the list
	type?: 'drop-target' | 'trash';
}

export function dropTarget(node: HTMLElement, options: DropTargetOptions) {
	const cleanup = dropTargetForElements({
		element: node,
		getData: ({ input, element }) => {
			const data = {
				type: options.type || 'drop-target',
				blockId: options.blockId,
				index: options.index
			};
			return attachClosestEdge(data, { input, element, allowedEdges: ['top', 'bottom'] });
		},
		onDragEnter: () => {
			node.classList.add('drag-over');
		},
		onDragLeave: () => {
			node.classList.remove('drag-over');
		},
		onDrop: () => {
			node.classList.remove('drag-over');
		}
	});

	return {
		destroy: cleanup
	};
}

export function draggableVariable(node: HTMLElement, options: { type: string } = { type: 'any' }) {
	const cleanup = draggable({
		element: node,
		getInitialData: () => ({
			type: 'variable',
			variableId: 'heldItem',
			variableType: options.type
		}),
		onDragStart: () => node.classList.add('dragging'),
		onDrop: () => node.classList.remove('dragging')
	});

	return {
		destroy: cleanup
	};
}

export function dropTargetForVariable(
	node: HTMLElement,
	options: { onDrop: () => void; allowedTypes?: string[] }
) {
	const cleanup = dropTargetForElements({
		element: node,
		canDrop: ({ source }) => {
			if (source.data.type !== 'variable') return false;
			if (!options.allowedTypes) return true;
			return options.allowedTypes.includes(source.data.variableType as string);
		},
		getData: () => ({ type: 'variable-slot' }),
		onDrop: () => options.onDrop(),
		onDragEnter: () => node.classList.add('drag-over'),
		onDragLeave: () => node.classList.remove('drag-over')
	});

	return {
		destroy: cleanup
	};
}
