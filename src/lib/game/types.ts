export type Direction = 'up' | 'down' | 'left' | 'right';

export type BlockType = 'move-right' | 'move-up' | 'move-down' | 'move-left' | 'loop';

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

export interface LevelDefinition {
	id: string;
	name: string;
	gridSize: { width: number; height: number };
	start: GridPosition;
	goal: GridPosition;
	walls: GridPosition[];
	availableBlocks: BlockType[];
	solutionPar?: number;
}

export type GameStatus = 'planning' | 'running' | 'won' | 'lost';
