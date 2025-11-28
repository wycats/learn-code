import type { GameModel } from './model.svelte';
import type { Block, Direction, GridPosition } from './types';
import { soundManager } from './sound';

const DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W'];

function getNextPosition(pos: GridPosition, dir: Direction): GridPosition {
	switch (dir) {
		case 'N':
			return { x: pos.x, y: pos.y - 1 };
		case 'E':
			return { x: pos.x + 1, y: pos.y };
		case 'S':
			return { x: pos.x, y: pos.y + 1 };
		case 'W':
			return { x: pos.x - 1, y: pos.y };
	}
}

function rotate(dir: Direction, turn: 'left' | 'right'): Direction {
	const idx = DIRECTIONS.indexOf(dir);
	if (turn === 'right') {
		return DIRECTIONS[(idx + 1) % 4];
	} else {
		return DIRECTIONS[(idx - 1 + 4) % 4];
	}
}

function isValidMove(pos: GridPosition, game: GameModel): boolean {
	// Check bounds
	if (
		pos.x < 0 ||
		pos.x >= game.level.gridSize.width ||
		pos.y < 0 ||
		pos.y >= game.level.gridSize.height
	) {
		return false;
	}

	// Check walls
	const key = `${pos.x},${pos.y}`;
	if (game.level.layout[key] === 'wall') {
		return false;
	}

	return true;
}

// --- Stack-based Interpreter ---

type ExecutionSnapshot = {
	characterPosition: GridPosition;
	characterOrientation: Direction;
	activeBlockId: string | null;
	executionState: Map<string, 'success' | 'failure' | 'running'>;
	loopProgress: Map<string, number>;
	lastEvent: { type: 'blocked' | 'win' | 'fail'; timestamp: number } | null;
	stack: StackFrame[]; // We need to snapshot the stack too!
	phase: 'before' | 'after';
};

type StackFrame = {
	blocks: Block[];
	index: number;
	loopCounter?: number;
	loopMax?: number;
	blockId?: string; // For loop block ID
};

export class StackInterpreter {
	game: GameModel;
	stack: StackFrame[] = [];
	history: ExecutionSnapshot[] = [];
	phase: 'before' | 'after' = 'before';

	constructor(game: GameModel) {
		this.game = game;
	}

	start() {
		this.game.status = 'running';
		this.game.activeBlockId = null;
		this.game.resetExecutionState();

		this.stack = [{ blocks: this.game.program, index: 0 }];
		this.history = [];
		this.phase = 'before';

		// Save initial state
		this.saveSnapshot();
	}

	private saveSnapshot() {
		// Deep clone stack
		const stackClone = this.stack.map((f) => ({ ...f }));

		this.history.push({
			characterPosition: { ...this.game.characterPosition },
			characterOrientation: this.game.characterOrientation,
			activeBlockId: this.game.activeBlockId,
			executionState: new Map(this.game.executionState),
			loopProgress: new Map(this.game.loopProgress),
			lastEvent: this.game.lastEvent ? { ...this.game.lastEvent } : null,
			stack: stackClone,
			phase: this.phase
		});
	}

	restoreSnapshot(snapshot: ExecutionSnapshot) {
		this.game.characterPosition = { ...snapshot.characterPosition };
		this.game.characterOrientation = snapshot.characterOrientation;
		this.game.activeBlockId = snapshot.activeBlockId;
		this.game.restoreExecutionState(snapshot.executionState);
		this.game.restoreLoopProgress(snapshot.loopProgress);
		this.game.lastEvent = snapshot.lastEvent;
		this.stack = snapshot.stack.map((f) => ({ ...f }));
		this.phase = snapshot.phase;
	}

	// Returns true if execution continues, false if done
	step(): boolean {
		if (this.stack.length === 0) {
			this.finish();
			return false;
		}

		// Save state before executing this step (if we are in 'before' phase? or always?)
		// If we save every micro-step, we can step back every micro-step.
		this.saveSnapshot();

		const frame = this.stack[this.stack.length - 1];

		// Check if we are done with this block list
		if (frame.index >= frame.blocks.length) {
			// If it's a loop, check counter
			if (frame.loopCounter !== undefined && frame.loopMax !== undefined) {
				frame.loopCounter++;
				if (frame.blockId) {
					this.game.loopProgress.set(frame.blockId, frame.loopCounter);
				}

				if (frame.loopCounter < frame.loopMax) {
					// Reset index to repeat loop
					frame.index = 0;

					// Reset execution state for children so they run "fresh"
					const resetState = (blocks: Block[]) => {
						for (const b of blocks) {
							this.game.executionState.delete(b.id);
							if (b.children) resetState(b.children);
						}
					};
					resetState(frame.blocks);

					// We continue immediately
					return this.step();
				} else {
					// Loop finished, clear progress
					if (frame.blockId) {
						this.game.loopProgress.delete(frame.blockId);
					}
				}
			}

			// Pop stack
			this.stack.pop();
			return this.step(); // Immediately try next step
		}

		const block = frame.blocks[frame.index];

		if (this.phase === 'before') {
			// Highlight
			this.game.activeBlockId = block.id;
			this.game.executionState.set(block.id, 'running');

			if (block.type === 'loop') {
				// Initialize loop progress if not set
				if (!this.game.loopProgress.has(block.id)) {
					this.game.loopProgress.set(block.id, 0);
				}

				// Enter loop
				const count = block.count || 100;
				this.stack.push({
					blocks: block.children || [],
					index: 0,
					loopCounter: 0,
					loopMax: count,
					blockId: block.id
				});

				// We don't switch phase to 'after' for loop, we just go to next step (which will be first child)
				// But we yield so user sees the loop block highlighted
				// Actually, if we push stack, next step will be child.
				// So we yield now.
				// But wait, if we yield now, next time we call step(), we are at top of stack (child).
				// So we need to advance? No, step() looks at top of stack.
				// So next call to step() will see child.
				return true;
			}

			this.phase = 'after';
			return true; // Yield to show highlight
		} else {
			// Execute Action
			const success = this.executeBlockAction(block);

			if (success) {
				this.game.executionState.set(block.id, 'success');
			} else {
				this.game.executionState.set(block.id, 'failure');
			}

			// Move to next instruction
			frame.index++;
			this.phase = 'before';

			// Check win
			if (checkWin(this.game)) {
				this.game.status = 'won';
				this.game.activeBlockId = null;
				soundManager.play('win');
				return false;
			}

			return true; // Yield to show result
		}
	}

	stepBack(): boolean {
		if (this.history.length <= 1) return false;

		this.history.pop(); // Remove current state
		const previous = this.history[this.history.length - 1];
		this.restoreSnapshot(previous);
		return true;
	}

	executeBlockAction(block: Block): boolean {
		switch (block.type) {
			case 'move-forward': {
				const nextPos = getNextPosition(
					this.game.characterPosition,
					this.game.characterOrientation
				);
				if (isValidMove(nextPos, this.game)) {
					this.game.characterPosition = nextPos;
					soundManager.play('step');
					return true;
				} else {
					console.log('Blocked!');
					this.game.lastEvent = { type: 'blocked', timestamp: Date.now() };
					soundManager.play('fail');
					return false;
				}
			}
			case 'turn-left':
				this.game.characterOrientation = rotate(this.game.characterOrientation, 'left');
				soundManager.play('turn');
				return true;
			case 'turn-right':
				this.game.characterOrientation = rotate(this.game.characterOrientation, 'right');
				soundManager.play('turn');
				return true;
		}
		return true;
	}

	finish() {
		if (this.game.status !== 'won') {
			this.game.status = 'planning';
		}
		this.game.activeBlockId = null;
	}
}

function checkWin(game: GameModel): boolean {
	return (
		game.characterPosition.x === game.level.goal.x && game.characterPosition.y === game.level.goal.y
	);
}

// Wrapper for backward compatibility with +page.svelte
export async function* runProgram(game: GameModel) {
	const interpreter = new StackInterpreter(game);
	interpreter.start();

	while (true) {
		if (game.status !== 'running') break;

		const continueExecution = interpreter.step();

		// Yield to let UI update
		yield { type: 'step-start', blockId: game.activeBlockId || '' };

		if (!continueExecution) break;
	}
}
