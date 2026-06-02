import type { Block } from './types';

export type CreateBlockId = () => string;

export type BlockListInsertTarget =
	| { kind: 'root' }
	| { kind: 'sibling'; targetId: string; edge: 'top' | 'bottom' | null }
	| { kind: 'children'; parentId: string };

function defaultCreateBlockId() {
	return crypto.randomUUID();
}

export function cloneBlockWithFreshIds(
	block: Block,
	createId: CreateBlockId = defaultCreateBlockId
): Block {
	const cloned: Block = {
		...block,
		id: createId()
	};
	delete cloned.isGhost;

	if (block.children) {
		cloned.children = block.children.map((child) => cloneBlockWithFreshIds(child, createId));
	}

	return cloned;
}

export function cloneBlocksWithFreshIds(
	blocks: readonly Block[],
	createId: CreateBlockId = defaultCreateBlockId
): Block[] {
	return blocks.map((block) => cloneBlockWithFreshIds(block, createId));
}

export function findBlockInList(blocks: readonly Block[], id: string): Block | null {
	for (const block of blocks) {
		if (block.id === id) return block;
		if (block.children) {
			const found = findBlockInList(block.children, id);
			if (found) return found;
		}
	}

	return null;
}

export function updateBlockInList(blocks: Block[], id: string, updates: Partial<Block>): boolean {
	const block = findBlockInList(blocks, id);
	if (!block) return false;

	Object.assign(block, updates);
	return true;
}

export function removeBlockFromList(blocks: Block[], id: string): Block | null {
	for (let index = 0; index < blocks.length; index++) {
		const block = blocks[index];
		if (block.id === id) {
			return blocks.splice(index, 1)[0] ?? null;
		}

		if (block.children) {
			const removed = removeBlockFromList(block.children, id);
			if (removed) return removed;
		}
	}

	return null;
}

export function insertBlockInList(
	blocks: Block[],
	target: BlockListInsertTarget,
	block: Block
): boolean {
	if (target.kind === 'root') {
		blocks.push(block);
		return true;
	}

	if (target.kind === 'children') {
		const parent = findBlockInList(blocks, target.parentId);
		if (!parent) return false;

		parent.children ??= [];
		parent.children.push(block);
		return true;
	}

	return insertSibling(blocks, target.targetId, target.edge, block);
}

function insertSibling(
	blocks: Block[],
	targetId: string,
	edge: 'top' | 'bottom' | null,
	block: Block
): boolean {
	const index = blocks.findIndex((candidate) => candidate.id === targetId);
	if (index !== -1) {
		const insertIndex = edge === 'top' ? index : index + 1;
		blocks.splice(insertIndex, 0, block);
		return true;
	}

	for (const candidate of blocks) {
		if (candidate.children && insertSibling(candidate.children, targetId, edge, block)) {
			return true;
		}
	}

	return false;
}
