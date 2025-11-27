import type { LevelDefinition, GameStatus, Block, Direction } from './types';

export class GameModel {
	// Game State
	status = $state<GameStatus>('planning');
	program = $state<Block[]>([]);

	// Execution State
	activeBlockIndex = $state<number | null>(null);

	// Level State
	level: LevelDefinition;
	characterPosition = $state<{ x: number; y: number }>({ x: 0, y: 0 });
	characterOrientation = $state<Direction>('E');

	// History State
	#history: Block[][] = [];
	#future: Block[][] = [];

	constructor(level: LevelDefinition) {
		this.level = level;
		this.reset();
	}

	reset() {
		this.status = 'planning';
		this.characterPosition = { ...this.level.start };
		this.characterOrientation = this.level.startOrientation;
		this.activeBlockIndex = null;
		// We don't clear program on reset, usually just execution state
		// But if it's a "hard" reset, maybe? For now, let's keep program.
	}

	// --- Program Management ---

	addBlock(block: Block) {
		if (this.status !== 'planning') return;
		this.#pushHistory();
		this.program.push(block);
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

	// --- History Management ---

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
}
