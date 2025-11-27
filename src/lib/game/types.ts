export type Direction = 'N' | 'E' | 'S' | 'W';

export type BlockType = 'move-forward' | 'turn-left' | 'turn-right' | 'loop';

export interface Block {
	id: string;
	type: BlockType;
	// For loops, we might have children or a count
	count?: number;
	children?: Block[];
}

export interface GridPosition {
	x: number;
	y: number;
}

export type CellType = 'grass' | 'water' | 'wall' | 'goal';

export interface Cell {
	type: CellType;
	position: GridPosition;
}

export interface LevelDefinition {
	id: string;
	name: string;
	gridSize: { width: number; height: number };
	start: GridPosition;
	startOrientation: Direction;
	goal: GridPosition;
	// Map of "x,y" to CellType for non-default cells
	layout: Record<string, CellType>;
	availableBlocks: BlockType[];
	solutionPar?: number;
}

export type GameStatus = 'planning' | 'running' | 'won' | 'lost';
