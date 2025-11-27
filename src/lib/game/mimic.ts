import type { GameModel } from './model.svelte';
import type { Block, Direction, GridPosition } from './types';

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

export async function* runProgram(game: GameModel) {
	game.status = 'running';
	game.activeBlockIndex = -1;

	for (let i = 0; i < game.program.length; i++) {
		const block = game.program[i];
		game.activeBlockIndex = i;

		// Yield before execution to show highlight
		yield { type: 'step-start', blockIndex: i };

		// Artificial delay for visualization (can be controlled by UI too)
		await new Promise((r) => setTimeout(r, 500));

		executeBlock(block, game);

		// Yield after execution to show result
		yield { type: 'step-end', blockIndex: i };

		// Check win/loss
		if (checkWin(game)) {
			game.status = 'won';
			return;
		}
		// Check loss (e.g. fell in water) - though isValidMove prevents walls,
		// water might be "valid" to move into but causes loss?
		// For now, let's assume water is just a valid tile you can stand on,
		// or maybe we need a checkLoss function.
	}

	game.status = 'planning'; // Or 'finished' if we want to keep state
	game.activeBlockIndex = null;
}

function executeBlock(block: Block, game: GameModel) {
	switch (block.type) {
		case 'move-forward': {
			const nextPos = getNextPosition(game.characterPosition, game.characterOrientation);
			if (isValidMove(nextPos, game)) {
				game.characterPosition = nextPos;
			} else {
				// Bump animation or sound?
				console.log('Blocked!');
			}
			break;
		}
		case 'turn-left':
			game.characterOrientation = rotate(game.characterOrientation, 'left');
			break;
		case 'turn-right':
			game.characterOrientation = rotate(game.characterOrientation, 'right');
			break;
	}
}

function checkWin(game: GameModel): boolean {
	return (
		game.characterPosition.x === game.level.goal.x && game.characterPosition.y === game.level.goal.y
	);
}
