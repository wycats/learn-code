import { interactionManager as defaultManager, InteractionManager } from './manager.svelte';
import type { Block, BlockType } from '$lib/game/types';
import type { GameModel } from '$lib/game/model.svelte';

export type EditorMode = 'idle' | 'move' | 'paste' | 'insert';

export class EditorState {
	mode = $state<EditorMode>('idle');
	clipboard = $state<Block[]>([]);
	isMultiSelectMode = $state(false);

	// Ghost State
	ghostTargetId = $state<string | null>(null);
	ghostSourceType = $state<BlockType | null>(null);
	defaultGhostId = $state<string | null>(null);

	manager: InteractionManager;

	constructor(manager: InteractionManager = defaultManager) {
		this.manager = manager;
	}

	// Selection is handled by interactionManager, but we provide helpers
	get selection() {
		return this.manager.selection;
	}

	setMode(mode: EditorMode) {
		this.mode = mode;
		if (mode === 'idle') {
			this.clearGhosts();
		}
	}

	copy(blocks: Block[]) {
		this.clipboard = JSON.parse(JSON.stringify(blocks));
		this.mode = 'paste';
	}

	clearGhosts() {
		this.ghostTargetId = null;
		this.ghostSourceType = null;
		this.defaultGhostId = null;
	}

	handleBlockClick(game: GameModel, id: string) {
		const block = this.findBlock(game.activeProgram, id);

		// If we clicked a ghost, confirm it
		if (block?.isGhost) {
			this.confirmGhost(game, block);
			return;
		}

		if (!block) return;

		// Move/Paste Mode Logic
		if (this.mode === 'move' || this.mode === 'paste') {
			// If we click the same target again, confirm the default ghost
			if (this.ghostTargetId === id && this.defaultGhostId) {
				const ghost = this.findBlock(game.activeProgram, this.defaultGhostId);
				if (ghost) {
					this.confirmGhost(game, ghost);
					return;
				}
			}

			// Clean up any existing ghosts before showing new ones
			this.removeGhosts(game.activeProgram);

			if (this.mode === 'move') {
				const sourceId = Array.from(this.manager.selection)[0];
				if (sourceId === id) {
					// Clicked source again -> do nothing (or maybe toggle selection?)
					return;
				}

				const sourceBlock = this.findBlock(game.activeProgram, sourceId!);
				if (sourceBlock) {
					this.showGhosts(game, block, sourceBlock);
				}
			} else if (this.mode === 'paste' && this.clipboard.length > 0) {
				this.showGhosts(game, block, this.clipboard[0]);
			}
			return;
		}

		// Multi-Select Logic
		if (this.isMultiSelectMode) {
			this.manager.select(id, true);
			return;
		}

		// Default Selection
		this.manager.select(id);
	}

	showGhosts(game: GameModel, targetBlock: Block, source: Block | BlockType) {
		const sourceType = typeof source === 'string' ? source : source.type;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, ...sourceProps } = typeof source === 'string' ? { id: '' } : source;

		this.ghostTargetId = targetBlock.id;
		this.ghostSourceType = sourceType;

		const ghostBefore: Block = {
			id: crypto.randomUUID(),
			type: sourceType,
			isGhost: true,
			...sourceProps
		};
		const ghostAfter: Block = {
			id: crypto.randomUUID(),
			type: sourceType,
			isGhost: true,
			...sourceProps
		};
		const ghostInside: Block = {
			id: crypto.randomUUID(),
			type: sourceType,
			isGhost: true,
			...sourceProps
		};

		const insertGhostsRecursive = (blocks: Block[]): boolean => {
			const index = blocks.findIndex((b) => b.id === targetBlock.id);
			if (index !== -1) {
				// If target is loop, offer Before, Inside and After
				if (targetBlock.type === 'loop') {
					// Insert ghost after loop
					blocks.splice(index + 1, 0, ghostAfter);
					// Insert ghost before loop
					blocks.splice(index, 0, ghostBefore);

					// Insert ghost inside loop
					if (!targetBlock.children) targetBlock.children = [];
					targetBlock.children.push(ghostInside);

					this.defaultGhostId = ghostInside.id;
				} else {
					// If target is regular block, offer Before and After
					blocks.splice(index + 1, 0, ghostAfter);
					blocks.splice(index, 0, ghostBefore);

					this.defaultGhostId = ghostAfter.id;
				}
				return true;
			}

			for (const block of blocks) {
				if (block.children && insertGhostsRecursive(block.children)) return true;
			}
			return false;
		};

		insertGhostsRecursive(game.activeProgram);
		game.activeProgram = [...game.activeProgram];
	}

	confirmGhost(game: GameModel, ghostBlock: Block) {
		game.commit();

		// Move Mode: Delete original block
		if (this.mode === 'move') {
			const selectedId = Array.from(this.manager.selection)[0];
			if (selectedId) {
				this.removeBlock(game.activeProgram, selectedId);
			}
			this.setMode('idle');
		}

		// Paste Mode: Replace ghost with clipboard copies
		if (this.mode === 'paste' && this.clipboard.length > 0) {
			const newBlocks = this.clipboard.map((b) => this.deepCloneWithNewIds(b));

			const finalizePaste = (blocks: Block[]) => {
				for (let i = blocks.length - 1; i >= 0; i--) {
					const b = blocks[i];
					if (b.id === ghostBlock.id) {
						// Replace ghost with new blocks
						blocks.splice(i, 1, ...newBlocks);
					} else if (b.isGhost) {
						blocks.splice(i, 1);
					}
					if (b.children) finalizePaste(b.children);
				}
			};
			finalizePaste(game.activeProgram);
			game.activeProgram = [...game.activeProgram];

			this.manager.clearSelection();
			for (const b of newBlocks) this.manager.select(b.id, true);
			this.setMode('idle');
			this.clearGhosts();
			return;
		}

		const finalize = (blocks: Block[]) => {
			for (let i = blocks.length - 1; i >= 0; i--) {
				const b = blocks[i];
				if (b.id === ghostBlock.id) {
					delete b.isGhost;
				} else if (b.isGhost) {
					blocks.splice(i, 1);
				}

				if (b.children) {
					finalize(b.children);
				}
			}
		};
		finalize(game.activeProgram);
		game.activeProgram = [...game.activeProgram];

		// Restore selection to the target block (if it exists) so we can keep editing relative to it
		if (this.ghostTargetId) {
			this.manager.select(this.ghostTargetId);
		} else {
			// Fallback to selecting the new block if we lost context
			this.manager.select(ghostBlock.id);
		}

		this.clearGhosts();
	}

	private removeGhosts(blocks: Block[]) {
		for (let i = blocks.length - 1; i >= 0; i--) {
			const b = blocks[i];
			if (b.isGhost) {
				blocks.splice(i, 1);
			} else if (b.children) {
				this.removeGhosts(b.children);
			}
		}
	}

	private findBlock(blocks: Block[], id: string): Block | null {
		for (const block of blocks) {
			if (block.id === id) return block;
			if (block.children) {
				const found = this.findBlock(block.children, id);
				if (found) return found;
			}
		}
		return null;
	}

	private removeBlock(blocks: Block[], id: string): boolean {
		const index = blocks.findIndex((b) => b.id === id);
		if (index !== -1) {
			blocks.splice(index, 1);
			return true;
		}
		for (const block of blocks) {
			if (block.children && this.removeBlock(block.children, id)) {
				return true;
			}
		}
		return false;
	}

	private deepCloneWithNewIds(block: Block): Block {
		const newBlock = { ...block, id: crypto.randomUUID() };
		if (newBlock.children) {
			newBlock.children = newBlock.children.map((child) => this.deepCloneWithNewIds(child));
		}
		delete newBlock.isGhost;
		return newBlock;
	}
}

export const editorState = new EditorState();
