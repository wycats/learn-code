import type { LevelDefinition, GameStatus, Block } from './types';

export class GameModel {
	// Game State
	status = $state<GameStatus>('planning');
	program = $state<Block[]>([]);

	// Level State
	level: LevelDefinition;
	characterPosition = $state<{ x: number; y: number }>({ x: 0, y: 0 });

	constructor(level: LevelDefinition) {
		this.level = level;
		this.reset();
	}

	reset() {
		this.status = 'planning';
		this.characterPosition = { ...this.level.start };
	}

	addBlock(block: Block) {
		if (this.status !== 'planning') return;
		this.program.push(block);
	}

	// Snapshot for Undo (to be implemented)
	serialize() {
		return {
			program: structuredClone($state.snapshot(this.program))
			// We might not need to snapshot status/position for simple undo
		};
	}
}
