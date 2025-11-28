import type { LevelDefinition, GameStatus, Block, Direction } from './types';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

export class GameModel {
	// Game State
	status = $state<GameStatus>('planning');
	program = $state<Block[]>([]);
	functions = $state<Record<string, Block[]>>({});
	editingContext = $state<string | null>(null); // null = main program, string = function name

	// Execution State
	activeBlockId = $state<string | null>(null);
	readonly executionState = new SvelteMap<string, 'success' | 'failure' | 'running'>();
	readonly loopProgress = new SvelteMap<string, number>();

	// Level State
	level: LevelDefinition;
	characterPosition = $state<{ x: number; y: number }>({ x: 0, y: 0 });
	characterOrientation = $state<Direction>('E');
	lastEvent = $state<{ type: 'blocked' | 'win' | 'fail'; timestamp: number } | null>(null);
	storyIndex = $state(0);

	// History State
	#history: { program: Block[]; functions: Record<string, Block[]> }[] = [];
	#future: { program: Block[]; functions: Record<string, Block[]> }[] = [];

	// Hint State
	startTime = Date.now();
	failedAttempts = $state(0);
	lastInteractionTime = $state(Date.now());
	activeHintId = $state<string | null>(null);

	constructor(level: LevelDefinition) {
		this.level = level;
		// Load initial program if defined
		if (this.level.initialProgram) {
			this.program = JSON.parse(JSON.stringify(this.level.initialProgram));
		}
		// Load functions if defined
		if (this.level.functions) {
			this.functions = JSON.parse(JSON.stringify(this.level.functions));
		}
		this.reset();
		if (this.level.intro && this.level.intro.length > 0) {
			this.status = 'story';
			this.storyIndex = 0;
		} else {
			this.status = 'goal';
		}
		this.startTime = Date.now();
		this.lastInteractionTime = Date.now();
	}

	reset() {
		// If we are in story or goal, don't reset to planning yet
		if (this.status === 'story' || this.status === 'goal') return;

		this.status = 'planning';
		this.characterPosition = { ...this.level.start };
		this.characterOrientation = this.level.startOrientation;
		this.activeBlockId = null;
		this.lastEvent = null; // Clear last event (e.g. blocked/fail)
		this.resetExecutionState();
		// We don't clear program on reset, usually just execution state
		// But if it's a "hard" reset, maybe? For now, let's keep program.
	}

	recordInteraction() {
		this.lastInteractionTime = Date.now();
	}

	recordFailure() {
		this.failedAttempts++;
	}

	checkHints() {
		if (!this.level.hints) return;
		const now = Date.now();
		const elapsed = (now - this.startTime) / 1000;
		const idle = (now - this.lastInteractionTime) / 1000;

		// If we already have a hint, do we keep it?
		// For now, let's allow new hints to override if they trigger later.
		// But we should probably track which hints have been shown to avoid spam.
		// Let's just show the first valid one for now.

		for (const hint of this.level.hints) {
			// Simple logic: if trigger met, show it.
			// Ideally we'd have a "shown" set.
			let triggered = false;
			if (hint.trigger.type === 'time' && elapsed >= hint.trigger.value) triggered = true;
			if (hint.trigger.type === 'attempts' && this.failedAttempts >= hint.trigger.value)
				triggered = true;
			if (hint.trigger.type === 'idle' && idle >= hint.trigger.value) triggered = true;
			if (hint.trigger.type === 'story-step') {
				const currentSegment = this.currentStorySegment;
				if (currentSegment && currentSegment.id === hint.trigger.segmentId) {
					triggered = true;
				}
			}

			if (triggered) {
				// Only set if different (to avoid reactivity loops if we use this in effect)
				if (this.activeHintId !== hint.id) {
					this.activeHintId = hint.id;
				}
				return; // Show highest priority (first in list)
			}
		}
	}


	get currentStorySegment() {
		if (this.status !== 'story') return null;
		if (this.level.intro && this.storyIndex < this.level.intro.length) {
			return this.level.intro[this.storyIndex];
		}
		return null;
	}

	get displaySegment(): import('./types').StorySegment | null {
		// Priority: Hint > Story
		if (this.activeHintId && this.level.hints) {
			const hint = this.level.hints.find((h) => h.id === this.activeHintId);
			if (hint) {
				return {
					speaker: 'Guide',
					text: hint.text,
					emotion: 'thinking',
					highlight: hint.highlight ? { target: hint.highlight, type: 'pulse' } : undefined
				};
			}
		}
		return this.currentStorySegment;
	}

	dismissHint() {
		this.activeHintId = null;
	}

	nextStorySegment() {
		if (this.level.intro && this.storyIndex < this.level.intro.length - 1) {
			this.storyIndex++;
		} else {
			this.status = 'goal';
			this.storyIndex = 0;
		}
	}

	resetExecutionState() {
		this.executionState.clear();
		this.loopProgress.clear();
	}

	restoreExecutionState(
		state:
			| Map<string, 'success' | 'failure' | 'running'>
			| SvelteMap<string, 'success' | 'failure' | 'running'>
	) {
		this.executionState.clear();
		for (const [k, v] of state) {
			this.executionState.set(k, v);
		}
	}

	restoreLoopProgress(progress: Map<string, number> | SvelteMap<string, number>) {
		this.loopProgress.clear();
		for (const [k, v] of progress) {
			this.loopProgress.set(k, v);
		}
	}

	// --- Program Management ---

	get activeProgram() {
		if (this.editingContext && this.functions[this.editingContext]) {
			return this.functions[this.editingContext];
		}
		return this.program;
	}

	set activeProgram(blocks: Block[]) {
		if (this.editingContext && this.functions[this.editingContext]) {
			this.functions[this.editingContext] = blocks;
		} else {
			this.program = blocks;
		}
	}

	checkTrigger(type: 'block-placed' | 'program-run' | 'level-complete', payload?: Block) {
		if (this.status !== 'story') return;
		const segment = this.currentStorySegment;
		if (!segment?.advanceCondition) return;

		const condition = segment.advanceCondition;
		if (condition.type !== type) return;

		if (type === 'block-placed') {
			if (condition.blockType && payload?.type !== condition.blockType) return;
		}

		// If we got here, condition is met!
		this.nextStorySegment();
	}

	addBlock(block: Block) {
		if (this.status !== 'planning' && this.status !== 'story') return;
		this.recordInteraction();
		this.#pushHistory();
		this.activeProgram.push(block);
		this.checkTrigger('block-placed', block);
	}

	insertBlockAfter(targetId: string, newBlock: Block) {
		if (this.status !== 'planning' && this.status !== 'story') return;
		this.recordInteraction();

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

		if (insertInList(this.activeProgram)) {
			this.checkTrigger('block-placed', newBlock);
		}
	}

	insertBlockIntoContainer(containerId: string, newBlock: Block) {
		if (this.status !== 'planning' && this.status !== 'story') return;
		this.recordInteraction();

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

		if (insertInList(this.activeProgram)) {
			this.checkTrigger('block-placed', newBlock);
		}
	}

	removeBlock(index: number) {
		if (this.status !== 'planning' && this.status !== 'story') return;
		this.recordInteraction();
		this.#pushHistory();
		this.activeProgram.splice(index, 1);
	}

	reorderBlocks(fromIndex: number, toIndex: number) {
		if (this.status !== 'planning' && this.status !== 'story') return;
		this.recordInteraction();
		this.#pushHistory();
		const [block] = this.activeProgram.splice(fromIndex, 1);
		this.activeProgram.splice(toIndex, 0, block);
	}

	clearProgram() {
		if (this.status !== 'planning' && this.status !== 'story') return;
		this.recordInteraction();
		this.#pushHistory();
		// We can't reassign activeProgram if it's a proxy property, but we can clear the array
		this.activeProgram.length = 0;
	}

	updateBlock(id: string, updates: Partial<Block>) {
		if (this.status !== 'planning' && this.status !== 'story') return;
		this.recordInteraction();

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

		updateInList(this.activeProgram);
	}

	deleteBlock(id: string) {
		if (this.status !== 'planning' && this.status !== 'story') return;
		this.recordInteraction();

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

		deleteFromList(this.activeProgram);
	}

	deleteBlocks(ids: string[]) {
		if (this.status !== 'planning' && this.status !== 'story') return;
		if (ids.length === 0) return;
		this.recordInteraction();

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

		deleteFromList(this.activeProgram);
	}

	// --- History Management ---

	commit() {
		if (this.status !== 'planning' && this.status !== 'story') return;
		this.#pushHistory();
	}

	#pushHistory() {
		// Snapshot the current program AND functions
		this.#history.push({
			program: $state.snapshot(this.program),
			functions: $state.snapshot(this.functions)
		});
		this.#future = []; // Clear redo stack on new action
	}

	undo() {
		if (this.#history.length === 0) return;

		const previous = this.#history.pop();
		if (previous) {
			this.#future.push({
				program: $state.snapshot(this.program),
				functions: $state.snapshot(this.functions)
			});
			this.program = previous.program;
			this.functions = previous.functions;
		}
	}

	redo() {
		if (this.#future.length === 0) return;

		const next = this.#future.pop();
		if (next) {
			this.#history.push({
				program: $state.snapshot(this.program),
				functions: $state.snapshot(this.functions)
			});
			this.program = next.program;
			this.functions = next.functions;
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
