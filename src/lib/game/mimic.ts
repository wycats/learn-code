import type { GameModel } from './model.svelte';
import type { Block, Direction, GridPosition, VariableRef } from './types';
import { soundManager } from './sound';
import { resolveItemDefinition } from './utils';

const DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W'];

function resolveValue(
	game: GameModel,
	value: number | VariableRef | undefined
): number | undefined {
	if (value === undefined) return undefined;
	if (typeof value === 'number') return value;
	if (value.type === 'variable' && value.variableId === 'heldItem') {
		if (game.heldItem) {
			const def = resolveItemDefinition(game.level, game.heldItem.type);
			if (def && def.behavior === 'value') {
				return game.heldItem.value;
			}
		}
		return 0;
	}
	return 0;
}

function resolveTile(game: GameModel, x: number, y: number) {
	const key = `${x},${y}`;
	const typeId = game.level.layout[key] || game.level.defaultTerrain || 'grass';

	// Check if it's a custom tile
	if (game.level.customTiles && game.level.customTiles[typeId]) {
		const custom = game.level.customTiles[typeId];
		return {
			type: custom.type,
			passableBy: custom.passableBy,
			onEnter: custom.onEnter
		};
	}

	// Built-in defaults
	if (typeId === 'water') return { type: 'water', passableBy: 'boat' };
	if (typeId === 'void') return { type: 'hazard', onEnter: 'kill' };
	if (typeId === 'spikes') return { type: 'hazard', onEnter: 'damage' };
	if (typeId === 'fire') return { type: 'hazard', onEnter: 'damage' };
	if (typeId === 'hazard') return { type: 'hazard', onEnter: 'kill' };
	if (typeId === 'ice') return { type: 'ice', onEnter: 'slide' };
	if (typeId === 'wall') return { type: 'wall' };

	return { type: 'floor' };
}

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
	const tile = resolveTile(game, pos.x, pos.y);
	if (tile.type === 'wall') {
		// Check if it's passable by held item
		if (tile.passableBy && game.heldItem?.type === tile.passableBy) {
			return true;
		}
		return false;
	}

	if (tile.type === 'water') {
		// Check if it's passable by held item (boat)
		// We use the generic passableBy if set, or default to boat for water
		const requiredItem = tile.passableBy || 'boat';
		// Check if we are riding the required vehicle
		if (game.vehicle?.type === requiredItem) return true;
		// Fallback: Check if we are holding the item (legacy support or magic items)
		return game.heldItem?.type === requiredItem;
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
	context?: string | null; // The editing context this frame belongs to
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

		this.stack = [{ blocks: this.game.program, index: 0, context: null }];
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

		// Sync context with the current frame
		if (frame.context !== undefined && this.game.editingContext !== frame.context) {
			this.game.editingContext = frame.context;
		}

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

			// Restore context of the new top frame
			if (this.stack.length > 0) {
				const top = this.stack[this.stack.length - 1];
				this.game.editingContext = top.context ?? null;
			}

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
				const count = resolveValue(this.game, block.count) ?? Infinity;
				this.stack.push({
					blocks: block.children || [],
					index: 0,
					loopCounter: 0,
					loopMax: count,
					blockId: block.id,
					context: frame.context // Inherit context
				});

				// Advance past the loop block in the parent frame
				frame.index++;

				// We yield to show the loop block highlighted
				return true;
			}

			if (block.type === 'call') {
				if (this.stack.length >= 50) {
					console.error('Stack overflow');
					this.game.lastEvent = { type: 'fail', timestamp: Date.now() };
					this.game.executionState.set(block.id, 'failure');
					return false;
				}

				const funcName = block.functionName;
				// Use game.functions (current state) instead of game.level.functions (initial state)
				if (funcName && this.game.functions && this.game.functions[funcName]) {
					const funcBlocks = this.game.functions[funcName];

					// Reset execution state for function blocks so they run "fresh"
					const resetState = (blocks: Block[]) => {
						for (const b of blocks) {
							this.game.executionState.delete(b.id);
							if (b.children) resetState(b.children);
						}
					};
					resetState(funcBlocks);

					this.stack.push({
						blocks: funcBlocks,
						index: 0,
						context: funcName
					});
				}

				// Mark the call block as success since we have successfully initiated the call
				this.game.executionState.set(block.id, 'success');

				// Advance past the call block in the parent frame
				frame.index++;

				// We yield to show the call block highlighted
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
				// Pause on error
				this.game.status = 'planning'; // Or stay in 'running' but paused?
				// If we go to planning, the user can edit.
				// If we want to "pause", we need a 'paused' state or just stop stepping.
				// The user asked to "pause the program".
				// If we return false here, the run loop stops.
				// But we should probably leave the status as 'running' or 'paused' so the UI shows the error state.
				// Let's just return false to stop the loop, but keep status as running?
				// No, if status is running, the UI might think it's still going.
				// Let's set activeBlockId to the failed block so it stays highlighted red.
				return false;
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
		if (this.history.length === 0) return false;

		const previous = this.history.pop(); // Remove and get current state
		if (previous) {
			this.restoreSnapshot(previous);
			return true;
		}
		return false;
	}

	executeBlockAction(block: Block): boolean {
		switch (block.type) {
			case 'move-forward': {
				const nextPos = getNextPosition(
					this.game.characterPosition,
					this.game.characterOrientation
				);
				if (isValidMove(nextPos, this.game)) {
					// Check for Hazard or Ice
					const tile = resolveTile(this.game, nextPos.x, nextPos.y);

					if (tile.onEnter === 'kill') {
						this.game.characterPosition = nextPos;
						soundManager.play('fail');

						// Determine reason for specific animations
						const rawTileId =
							this.game.level.layout[`${nextPos.x},${nextPos.y}`] ||
							this.game.level.defaultTerrain ||
							'grass';
						const reason = rawTileId === 'void' ? 'void' : 'hazard';

						this.game.lastEvent = { type: 'fail', reason, timestamp: Date.now() };
						this.game.recordFailure();
						return false;
					}

					if (tile.onEnter === 'damage') {
						this.game.characterPosition = nextPos;
						this.game.lives--;
						soundManager.play('hurt');

						if (this.game.lives <= 0) {
							this.game.lastEvent = { type: 'fail', reason: 'hazard', timestamp: Date.now() };
							this.game.recordFailure();
							soundManager.play('fail');
							return false;
						}
						// Continue execution if lives > 0
						return true;
					}

					if (tile.onEnter === 'slide') {
						// Slide logic
						let currentSlidePos = nextPos;
						// Limit slide to prevent infinite loops (though unlikely with bounds)
						for (let i = 0; i < 20; i++) {
							const slideNext = getNextPosition(currentSlidePos, this.game.characterOrientation);
							if (isValidMove(slideNext, this.game)) {
								currentSlidePos = slideNext;
								// Check if we slid into a hazard
								const slideTile = resolveTile(this.game, currentSlidePos.x, currentSlidePos.y);
								if (slideTile.onEnter === 'kill') {
									this.game.characterPosition = currentSlidePos;
									soundManager.play('fail');
									this.game.lastEvent = { type: 'fail', timestamp: Date.now() };
									this.game.recordFailure();
									return false;
								}
								if (slideTile.onEnter !== 'slide') {
									// Stopped sliding
									break;
								}
							} else {
								// Hit a wall
								break;
							}
						}
						this.game.characterPosition = currentSlidePos;
						// soundManager.play('slide'); // TODO: Add slide sound
						soundManager.play('step');
						return true;
					}

					this.game.characterPosition = nextPos;
					soundManager.play('step');
					return true;
				} else {
					console.log('Blocked!');
					this.game.lastEvent = { type: 'blocked', timestamp: Date.now() };
					this.game.recordFailure();
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
			case 'pick-up': {
				const pos = this.game.characterPosition;
				const key = `${pos.x},${pos.y}`;

				if (this.game.collectedItems.has(key)) {
					soundManager.play('fail');
					this.game.lastEvent = { type: 'fail', timestamp: Date.now() };
					this.game.recordFailure();
					return false;
				}

				const item = this.game.level.items?.[key];
				if (item) {
					const def = resolveItemDefinition(this.game.level, item.type);
					// Special handling for vehicles
					if (def && def.behavior === 'vehicle') {
						// Legacy support: If using pick-up on a boat, treat it as boarding
						// But ideally we want them to use the 'board' block
						// For now, let's allow it but maybe warn?
						// Or just disallow it to force the new block?
						// Let's disallow it to enforce the new concept.
						soundManager.play('fail');
						this.game.lastEvent = { type: 'fail', timestamp: Date.now() };
						this.game.recordFailure();
						return false;
					}

					this.game.heldItem = item;
					this.game.collectedItems.add(key);
					soundManager.play('step'); // TODO: Add pickup sound
					return true;
				}

				soundManager.play('fail');
				this.game.lastEvent = { type: 'fail', timestamp: Date.now() };
				this.game.recordFailure();
				return false;
			}
			case 'board': {
				const pos = this.game.characterPosition;
				const key = `${pos.x},${pos.y}`;

				const item = this.game.level.items?.[key];
				const def = item ? resolveItemDefinition(this.game.level, item.type) : undefined;

				if (item && def && def.behavior === 'vehicle') {
					this.game.vehicle = item;
					this.game.collectedItems.add(key);
					soundManager.play('step'); // TODO: Add board sound
					return true;
				}

				soundManager.play('fail');
				this.game.lastEvent = { type: 'fail', timestamp: Date.now() };
				this.game.recordFailure();
				return false;
			}
		}
		return true;
	}

	finish() {
		if (this.game.status !== 'won') {
			this.game.status = 'planning';
			this.game.recordFailure();
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
