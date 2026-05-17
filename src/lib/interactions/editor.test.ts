import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditorState } from './editor.svelte';
import { InteractionManager } from './manager.svelte';
import { InteractionRegistry } from './registry';
import type { GameModel } from '$lib/game/model.svelte';
import type { Block } from '$lib/game/types';

// Mock GameModel
const createMockGame = () =>
	({
		activeProgram: [] as Block[],
		commit: vi.fn(),
		deleteBlocks: vi.fn(),
		addBlock: vi.fn(),
		insertBlockIntoContainer: vi.fn(),
		updateBlock: vi.fn(),
		clearProgram: vi.fn()
	}) as unknown as GameModel;

describe('EditorState', () => {
	let registry: InteractionRegistry;
	let manager: InteractionManager;
	let editor: EditorState;
	let game: GameModel;

	beforeEach(() => {
		registry = new InteractionRegistry();
		manager = new InteractionManager(registry);
		editor = new EditorState(manager);
		game = createMockGame();
	});

	it('starts in idle mode', () => {
		expect(editor.mode).toBe('idle');
	});

	it('copies blocks to clipboard', () => {
		const blocks: Block[] = [{ id: 'b1', type: 'move-forward' }];
		editor.copy(blocks);
		expect(editor.clipboard).toEqual(blocks);
		expect(editor.mode).toBe('paste');
	});

	it('clears ghosts when setting mode to idle', () => {
		editor.ghostTargetId = 'target';
		editor.setMode('idle');
		expect(editor.ghostTargetId).toBeNull();
	});

	describe('Ghost Logic', () => {
		it('shows ghosts around a target block', () => {
			const target: Block = { id: 'target', type: 'move-forward' };
			game.activeProgram = [target];

			editor.showGhosts(game, target, 'turn-left');

			// Should have inserted ghosts before and after
			expect(game.activeProgram).toHaveLength(3);
			expect(game.activeProgram[0].isGhost).toBe(true);
			expect(game.activeProgram[1].id).toBe('target');
			expect(game.activeProgram[2].isGhost).toBe(true);

			expect(editor.ghostTargetId).toBe('target');
			expect(editor.ghostSourceType).toBe('turn-left');
		});

		it('confirms a ghost selection', () => {
			const ghost: Block = { id: 'ghost', type: 'turn-left', isGhost: true };
			const target: Block = { id: 'target', type: 'move-forward' };
			game.activeProgram = [ghost, target];

			editor.confirmGhost(game, ghost);

			expect(game.commit).toHaveBeenCalled();
			expect(game.activeProgram).toHaveLength(2);
			expect(game.activeProgram[0].isGhost).toBeUndefined(); // Should be real now
		});

		it('moves a block when confirming ghost in move mode', () => {
			const source: Block = { id: 'source', type: 'move-forward' };
			const target: Block = { id: 'target', type: 'turn-left' };
			const ghost: Block = { id: 'ghost', type: 'move-forward', isGhost: true };

			game.activeProgram = [source, target, ghost];

			editor.setMode('move');
			manager.select('source');

			editor.confirmGhost(game, ghost);

			// Should have removed source and kept ghost (now real)
			expect(game.activeProgram).toHaveLength(2);
			expect(game.activeProgram.find((b) => b.id === 'source')).toBeUndefined();
			expect(game.activeProgram.find((b) => b.id === 'ghost')?.isGhost).toBeUndefined();
			expect(editor.mode).toBe('idle');
		});

		it('pastes clipboard when confirming ghost in paste mode', () => {
			const clipBlock: Block = { id: 'clip', type: 'pick-up' };
			const target: Block = { id: 'target', type: 'move-forward' };
			const ghost: Block = { id: 'ghost', type: 'pick-up', isGhost: true };

			game.activeProgram = [target, ghost];
			editor.clipboard = [clipBlock];
			editor.setMode('paste');

			editor.confirmGhost(game, ghost);

			// Should have replaced ghost with clipboard content
			expect(game.activeProgram).toHaveLength(2);
			const pasted = game.activeProgram.find((b) => b.type === 'pick-up');
			expect(pasted).toBeDefined();
			expect(pasted?.id).not.toBe('clip'); // Should have new ID
			expect(pasted?.isGhost).toBeUndefined();
			expect(editor.mode).toBe('idle');
		});

		it('shows ghosts when clicking a target in move mode', () => {
			const source: Block = { id: 'source', type: 'move-forward' };
			const target: Block = { id: 'target', type: 'turn-left' };
			game.activeProgram = [source, target];

			editor.setMode('move');
			manager.select('source');

			editor.handleBlockClick(game, 'target');

			expect(editor.ghostTargetId).toBe('target');
			expect(game.activeProgram.some((b) => b.isGhost)).toBe(true);
		});

		it('confirms default ghost when clicking target again', () => {
			const target: Block = { id: 'target', type: 'move-forward' };
			game.activeProgram = [target];

			editor.setMode('move'); // Must be in move/paste mode for this behavior

			// First click shows ghosts
			editor.showGhosts(game, target, 'turn-left');
			const defaultGhostId = editor.defaultGhostId;
			expect(defaultGhostId).toBeDefined();

			// Second click confirms default ghost
			editor.handleBlockClick(game, 'target');

			expect(game.commit).toHaveBeenCalled();
			expect(game.activeProgram.some((b) => b.id === defaultGhostId && !b.isGhost)).toBe(true);
		});
	});
});
