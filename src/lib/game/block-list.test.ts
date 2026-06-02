import { describe, expect, it } from 'vitest';
import type { Block } from './types';
import {
	cloneBlockWithFreshIds,
	findBlockInList,
	insertBlockInList,
	removeBlockFromList,
	updateBlockInList
} from './block-list';

function ids(...values: string[]) {
	let index = 0;
	return () => values[index++] ?? `extra-${index}`;
}

describe('block-list helpers', () => {
	it('clones nested blocks with fresh ids and removes ghost state', () => {
		const block: Block = {
			id: 'loop-1',
			type: 'loop',
			isGhost: true,
			children: [{ id: 'move-1', type: 'move-forward', isGhost: true }]
		};

		const cloned = cloneBlockWithFreshIds(block, ids('loop-2', 'move-2'));

		expect(cloned).toEqual({
			id: 'loop-2',
			type: 'loop',
			children: [{ id: 'move-2', type: 'move-forward' }]
		});
		expect(block.children?.[0].id).toBe('move-1');
	});

	it('finds, updates, and removes nested blocks', () => {
		const blocks: Block[] = [
			{
				id: 'loop-1',
				type: 'loop',
				children: [{ id: 'move-1', type: 'move-forward' }]
			}
		];

		expect(findBlockInList(blocks, 'move-1')?.type).toBe('move-forward');
		expect(updateBlockInList(blocks, 'move-1', { type: 'turn-left' })).toBe(true);
		expect(findBlockInList(blocks, 'move-1')?.type).toBe('turn-left');

		const removed = removeBlockFromList(blocks, 'move-1');
		expect(removed).toEqual({ id: 'move-1', type: 'turn-left' });
		expect(findBlockInList(blocks, 'move-1')).toBeNull();
	});

	it('inserts before, after, and inside nested blocks', () => {
		const blocks: Block[] = [
			{ id: 'first', type: 'move-forward' },
			{ id: 'loop', type: 'loop', children: [] }
		];

		insertBlockInList(
			blocks,
			{ kind: 'sibling', targetId: 'first', edge: 'top' },
			{
				id: 'before',
				type: 'turn-left'
			}
		);
		insertBlockInList(
			blocks,
			{ kind: 'sibling', targetId: 'first', edge: 'bottom' },
			{
				id: 'after',
				type: 'turn-right'
			}
		);
		insertBlockInList(
			blocks,
			{ kind: 'children', parentId: 'loop' },
			{
				id: 'inside',
				type: 'pick-up'
			}
		);

		expect(blocks.map((block) => block.id)).toEqual(['before', 'first', 'after', 'loop']);
		expect(blocks[3].children?.map((block) => block.id)).toEqual(['inside']);
	});

	it('copies draft blocks into a program with fresh nested ids', () => {
		const draftBlocks: Block[] = [
			{ id: 'draft-loop', type: 'loop', children: [{ id: 'draft-step', type: 'move-forward' }] }
		];
		const programBlocks: Block[] = [];
		const copied = cloneBlockWithFreshIds(draftBlocks[0], ids('program-loop', 'program-step'));

		insertBlockInList(programBlocks, { kind: 'root' }, copied);

		expect(draftBlocks).toEqual([
			{ id: 'draft-loop', type: 'loop', children: [{ id: 'draft-step', type: 'move-forward' }] }
		]);
		expect(programBlocks).toEqual([
			{ id: 'program-loop', type: 'loop', children: [{ id: 'program-step', type: 'move-forward' }] }
		]);
	});

	it('copies program blocks into a draft with fresh ids', () => {
		const programBlocks: Block[] = [{ id: 'program-step', type: 'move-forward' }];
		const draftBlocks: Block[] = [];
		const copied = cloneBlockWithFreshIds(programBlocks[0], ids('draft-step'));

		insertBlockInList(draftBlocks, { kind: 'root' }, copied);

		expect(programBlocks).toEqual([{ id: 'program-step', type: 'move-forward' }]);
		expect(draftBlocks).toEqual([{ id: 'draft-step', type: 'move-forward' }]);
	});

	it('removes draft blocks without touching program blocks', () => {
		const programBlocks: Block[] = [{ id: 'program-step', type: 'move-forward' }];
		const draftBlocks: Block[] = [{ id: 'draft-step', type: 'move-forward' }];

		const removed = removeBlockFromList(draftBlocks, 'draft-step');

		expect(removed).toEqual({ id: 'draft-step', type: 'move-forward' });
		expect(draftBlocks).toEqual([]);
		expect(programBlocks).toEqual([{ id: 'program-step', type: 'move-forward' }]);
	});
});
