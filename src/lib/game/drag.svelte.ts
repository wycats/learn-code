import type { Block } from './types';

let draggedBlock = $state<Block | null>(null);

export function getDraggedBlock() {
	return draggedBlock;
}

export function setDraggedBlock(block: Block | null) {
	draggedBlock = block;
}
