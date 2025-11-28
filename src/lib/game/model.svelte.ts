import type { LevelDefinition, GameStatus, Block, Direction } from './types';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

export class GameModel {
	// Game State
	status = $state<GameStatus>('planning');
	program = $state<Block[]>([]);

	// Execution State
	activeBlockId = $state<string | null>(null);
	executionState = new SvelteMap<string, 'success' | 'failure' | 'running'>();
	loopProgress = new SvelteMap<string, number>();

	// Level State
	level: LevelDefinition;
	characterPosition = $state<{ x: number; y: number }>({ x: 0, y: 0 });
	characterOrientation = $state<Direction>('E');
	lastEvent = $state<{ type: 'blocked' | 'win' | 'fail'; timestamp: number } | null>(null);

	// History State
	#history: Block[][] = [];
	#future: Block[][] = [];

	constructor(level: LevelDefinition) {
		this.level = level;
		// Load initial program if defined
		if (this.level.initialProgram) {
			this.program = JSON.parse(JSON.stringify(this.level.initialProgram));
		}
		this.reset();
		if (this.level.intro && this.level.intro.length > 0) {
			this.status = 'story';
		} else {
			this.status = 'goal';
		}
	}

	reset() {
		// If we are in story or goal, don't reset to planning yet
		if (this.status === 'story' || this.status === 'goal') return;

		this.status = 'planning';
		this.characterPosition = { ...this.level.start };
		this.characterOrientation = this.level.startOrientation;
		this.activeBlockId = null;
		this.executionState = new SvelteMap();
		this.loopProgress = new SvelteMap();
		// We don't clear program on reset, usually just execution state
		// But if it's a "hard" reset, maybe? For now, let's keep program.
	}

	// --- Program Management ---

	addBlock(block: Block) {
		if (this.status !== 'planning') return;
		this.#pushHistory();
		this.program.push(block);
	}

	insertBlockAfter(targetId: string, newBlock: Block) {
		if (this.status !== 'planning') return;

		const insertInList = (list: Block[]): boolean => {
			const index = list.findIndex((b) => b.id === targetId);
			if (index !== -1) {
				this.#pushHistory();
				list.splice(index + 1, 0, newBlock);
				return true;
			}
			for (const block of list) {
				if (block.children) {
					if (insertInList(block.children)) return true;
				}
			}
			return false;
		};

		insertInList(this.program);
	}

	insertBlockIntoContainer(containerId: string, newBlock: Block) {
		if (this.status !== 'planning') return;

		const insertInList = (list: Block[]): boolean => {
			for (const block of list) {
				if (block.id === containerId) {
					this.#pushHistory();
					if (!block.children) block.children = [];
					block.children.push(newBlock);
					return true;
				}
				if (block.children) {
					if (insertInList(block.children)) return true;
				}
			}
			return false;
		};

		insertInList(this.program);
	}

	removeBlock(index: number) {
		if (this.status !== 'planning') return;
		this.#pushHistory();
		this.program.splice(index, 1);
	}

	reorderBlocks(fromIndex: number, toIndex: number) {
		if (this.status !== 'planning') return;
		this.#pushHistory();
		const [block] = this.program.splice(fromIndex, 1);
		this.program.splice(toIndex, 0, block);
	}

	clearProgram() {
		if (this.status !== 'planning') return;
		this.#pushHistory();
		this.program = [];
	}

	updateBlock(id: string, updates: Partial<Block>) {
		if (this.status !== 'planning') return;

		// Helper to find and update
		const updateInList = (list: Block[]): boolean => {
			for (let i = 0; i < list.length; i++) {
				if (list[i].id === id) {
					this.#pushHistory(); // Save state before update
					Object.assign(list[i], updates);
					return true;
				}
				if (list[i].children) {
					if (updateInList(list[i].children!)) return true;
				}
			}
			return false;
		};

		updateInList(this.program);
	}

	deleteBlock(id: string) {
		if (this.status !== 'planning') return;

		const deleteFromList = (list: Block[]): boolean => {
			const index = list.findIndex((b) => b.id === id);
			if (index !== -1) {
				this.#pushHistory();
				list.splice(index, 1);
				return true;
			}
			for (const block of list) {
				if (block.children) {
					if (deleteFromList(block.children)) return true;
				}
			}
			return false;
		};

		deleteFromList(this.program);
	}

	deleteBlocks(ids: string[]) {
		if (this.status !== 'planning') return;
		if (ids.length === 0) return;

		this.#pushHistory();

		const idsToDelete = new SvelteSet(ids);

		const deleteFromList = (list: Block[]) => {
			for (let i = list.length - 1; i >= 0; i--) {
				const block = list[i];
				if (idsToDelete.has(block.id)) {
					list.splice(i, 1);
				} else if (block.children) {
					deleteFromList(block.children);
				}
			}
		};

		deleteFromList(this.program);
	}

	// --- History Management ---

	commit() {
		if (this.status !== 'planning') return;
		this.#pushHistory();
	}

	#pushHistory() {
		// Snapshot the current program
		this.#history.push($state.snapshot(this.program));
		this.#future = []; // Clear redo stack on new action
	}

	undo() {
		if (this.#history.length === 0) return;

		const previous = this.#history.pop();
		if (previous) {
			this.#future.push($state.snapshot(this.program));
			this.program = previous;
		}
	}

	redo() {
		if (this.#future.length === 0) return;

		const next = this.#future.pop();
		if (next) {
			this.#history.push($state.snapshot(this.program));
			this.program = next;
		}
	}

	get canUndo() {
		return this.#history.length > 0;
	}

	get canRedo() {
		return this.#future.length > 0;
	}

	get blockCount() {
		return countBlocks(this.program);
	}
}

function countBlocks(blocks: Block[]): number {
	let count = 0;
	for (const block of blocks) {
		count++;
		if (block.children) {
			count += countBlocks(block.children);
		}
	}
	return count;
}
