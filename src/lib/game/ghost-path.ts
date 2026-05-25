import type { Block, Direction, GridPosition, HeldItem, LevelDefinition } from './types';
import { canPassTile, resolveHeldValue, resolveTerrainTile } from './runtime-rules';
import { resolveItemDefinition } from './utils';

const DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W'];
const DEFAULT_STEP_CAP = 200;
const MAX_CALL_STACK_DEPTH = 50;
const MAX_SLIDE_STEPS = 20;

export type GhostPathOutcome = 'won' | 'blocked' | 'failed' | 'stopped-short' | 'capped';
export type GhostPathEvent =
	| 'start'
	| 'move'
	| 'turn'
	| 'pick-up'
	| 'board'
	| 'slide'
	| 'blocked'
	| 'failed'
	| 'won';

export type GhostPathEntry = Readonly<{
	step: number;
	position: Readonly<GridPosition>;
	orientation: Direction;
	blockId?: string;
	event: GhostPathEvent;
	attemptedPosition?: Readonly<GridPosition>;
}>;

export type GhostPathPreview = Readonly<{
	path: readonly GhostPathEntry[];
	finalPosition: Readonly<GridPosition>;
	finalOrientation: Direction;
	outcome: GhostPathOutcome;
}>;

export type GhostPathOptions = Readonly<{
	level: LevelDefinition;
	program: readonly Block[];
	functions?: Readonly<Record<string, readonly Block[]>>;
	stepCap?: number;
}>;

type MutableGhostPathEntry = {
	step: number;
	position: GridPosition;
	orientation: Direction;
	blockId?: string;
	event: GhostPathEvent;
	attemptedPosition?: GridPosition;
};

type SimulationState = {
	position: GridPosition;
	orientation: Direction;
	heldItem: HeldItem | null;
	vehicle: HeldItem | null;
	collectedItems: Set<string>;
	lives: number;
};

type SimulationFrame = {
	blocks: readonly Block[];
	index: number;
	loopCounter?: number;
	loopMax?: number;
};

export function simulateGhostPath({
	level,
	program,
	functions = {},
	stepCap = DEFAULT_STEP_CAP
}: GhostPathOptions): GhostPathPreview {
	const state: SimulationState = {
		position: clonePosition(level.start),
		orientation: level.startOrientation,
		heldItem: null,
		vehicle: null,
		collectedItems: new Set(),
		lives: level.startingLives ?? 1
	};
	const entries: MutableGhostPathEntry[] = [];
	const stack: SimulationFrame[] = [{ blocks: program, index: 0 }];
	let ticks = 0;

	appendEntry(entries, state, 'start');

	while (stack.length > 0) {
		if (ticks++ >= stepCap) {
			return freezePreview(state, entries, 'capped');
		}

		const frame = stack[stack.length - 1];

		if (frame.index >= frame.blocks.length) {
			if (frame.loopCounter !== undefined && frame.loopMax !== undefined) {
				frame.loopCounter++;
				if (frame.loopCounter < frame.loopMax) {
					frame.index = 0;
					continue;
				}
			}

			stack.pop();
			continue;
		}

		const block = frame.blocks[frame.index];

		if (block.type === 'loop') {
			frame.index++;
			const loopMax = resolveHeldValue(level, state.heldItem, block.count) ?? Infinity;
			stack.push({
				blocks: block.children ?? [],
				index: 0,
				loopCounter: 0,
				loopMax
			});
			continue;
		}

		if (block.type === 'call') {
			if (stack.length >= MAX_CALL_STACK_DEPTH) {
				appendEntry(entries, state, 'failed', block.id);
				return freezePreview(state, entries, 'failed');
			}

			frame.index++;
			const functionBlocks = block.functionName ? functions[block.functionName] : undefined;
			if (functionBlocks) {
				stack.push({ blocks: functionBlocks, index: 0 });
			}
			continue;
		}

		frame.index++;
		const outcome = executeAction(level, state, entries, block);
		if (outcome) {
			return freezePreview(state, entries, outcome);
		}

		if (isAtGoal(state.position, level.goal)) {
			entries[entries.length - 1].event = 'won';
			return freezePreview(state, entries, 'won');
		}
	}

	if (isAtGoal(state.position, level.goal)) {
		entries[entries.length - 1].event = 'won';
		return freezePreview(state, entries, 'won');
	}

	return freezePreview(state, entries, 'stopped-short');
}

function executeAction(
	level: LevelDefinition,
	state: SimulationState,
	entries: MutableGhostPathEntry[],
	block: Block
): GhostPathOutcome | null {
	switch (block.type) {
		case 'move-forward': {
			const nextPosition = getNextPosition(state.position, state.orientation);
			if (!canPassTile(level, nextPosition, state)) {
				appendEntry(entries, state, 'blocked', block.id, nextPosition);
				return 'blocked';
			}

			const tile = resolveTerrainTile(level, nextPosition.x, nextPosition.y);

			if (tile.onEnter === 'kill') {
				state.position = nextPosition;
				appendEntry(entries, state, 'failed', block.id);
				return 'failed';
			}

			if (tile.onEnter === 'damage') {
				state.position = nextPosition;
				state.lives--;
				appendEntry(entries, state, state.lives <= 0 ? 'failed' : 'move', block.id);
				return state.lives <= 0 ? 'failed' : null;
			}

			if (tile.onEnter === 'slide') {
				state.position = slide(level, state, nextPosition);
				appendEntry(entries, state, 'slide', block.id);

				const slideTile = resolveTerrainTile(level, state.position.x, state.position.y);
				if (slideTile.onEnter === 'kill') {
					entries[entries.length - 1].event = 'failed';
					return 'failed';
				}

				return null;
			}

			state.position = nextPosition;
			appendEntry(entries, state, 'move', block.id);
			return null;
		}
		case 'turn-left':
			state.orientation = rotate(state.orientation, 'left');
			appendEntry(entries, state, 'turn', block.id);
			return null;
		case 'turn-right':
			state.orientation = rotate(state.orientation, 'right');
			appendEntry(entries, state, 'turn', block.id);
			return null;
		case 'pick-up': {
			const key = positionKey(state.position);
			if (state.collectedItems.has(key)) {
				appendEntry(entries, state, 'failed', block.id);
				return 'failed';
			}

			const item = level.items?.[key];
			const itemDefinition = item ? resolveItemDefinition(level, item.type) : undefined;
			if (!item || itemDefinition?.behavior === 'vehicle') {
				appendEntry(entries, state, 'failed', block.id);
				return 'failed';
			}

			state.heldItem = item;
			state.collectedItems.add(key);
			appendEntry(entries, state, 'pick-up', block.id);
			return null;
		}
		case 'board': {
			const key = positionKey(state.position);
			const item = level.items?.[key];
			const itemDefinition = item ? resolveItemDefinition(level, item.type) : undefined;

			if (!item || itemDefinition?.behavior !== 'vehicle') {
				appendEntry(entries, state, 'failed', block.id);
				return 'failed';
			}

			state.vehicle = item;
			state.collectedItems.add(key);
			appendEntry(entries, state, 'board', block.id);
			return null;
		}
	}

	return null;
}

function slide(
	level: LevelDefinition,
	state: SimulationState,
	firstSlidePosition: GridPosition
): GridPosition {
	let currentPosition = firstSlidePosition;

	for (let i = 0; i < MAX_SLIDE_STEPS; i++) {
		const nextPosition = getNextPosition(currentPosition, state.orientation);
		if (!canPassTile(level, nextPosition, state)) {
			break;
		}

		currentPosition = nextPosition;
		const tile = resolveTerrainTile(level, currentPosition.x, currentPosition.y);
		if (tile.onEnter !== 'slide') {
			break;
		}
	}

	return currentPosition;
}

function getNextPosition(position: GridPosition, direction: Direction): GridPosition {
	switch (direction) {
		case 'N':
			return { x: position.x, y: position.y - 1 };
		case 'E':
			return { x: position.x + 1, y: position.y };
		case 'S':
			return { x: position.x, y: position.y + 1 };
		case 'W':
			return { x: position.x - 1, y: position.y };
	}
}

function rotate(direction: Direction, turn: 'left' | 'right'): Direction {
	const index = DIRECTIONS.indexOf(direction);
	if (turn === 'right') return DIRECTIONS[(index + 1) % DIRECTIONS.length];
	return DIRECTIONS[(index - 1 + DIRECTIONS.length) % DIRECTIONS.length];
}

function appendEntry(
	entries: MutableGhostPathEntry[],
	state: SimulationState,
	event: GhostPathEvent,
	blockId?: string,
	attemptedPosition?: GridPosition
) {
	entries.push({
		step: entries.length,
		position: clonePosition(state.position),
		orientation: state.orientation,
		blockId,
		event,
		...(attemptedPosition ? { attemptedPosition: clonePosition(attemptedPosition) } : {})
	});
}

function isAtGoal(position: GridPosition, goal: GridPosition): boolean {
	return position.x === goal.x && position.y === goal.y;
}

function positionKey(position: GridPosition): string {
	return `${position.x},${position.y}`;
}

function clonePosition(position: GridPosition): GridPosition {
	return { x: position.x, y: position.y };
}

function freezePreview(
	state: SimulationState,
	entries: MutableGhostPathEntry[],
	outcome: GhostPathOutcome
): GhostPathPreview {
	const path = entries.map((entry) => {
		const frozenEntry = {
			...entry,
			position: Object.freeze(clonePosition(entry.position)),
			...(entry.attemptedPosition
				? { attemptedPosition: Object.freeze(clonePosition(entry.attemptedPosition)) }
				: {})
		};
		return Object.freeze(frozenEntry);
	});

	return Object.freeze({
		path: Object.freeze(path),
		finalPosition: Object.freeze(clonePosition(state.position)),
		finalOrientation: state.orientation,
		outcome
	});
}
