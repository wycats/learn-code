import { GameModel } from './model.svelte';
import type { LevelDefinition, CellType, GridPosition } from './types';

export type BuilderTool = 
	| { type: 'terrain'; value: CellType }
	| { type: 'erase' };

export class BuilderModel {
	// The source of truth for the level being edited
	level: LevelDefinition = $state({
		id: crypto.randomUUID(),
		name: 'New Level',
		gridSize: { width: 5, height: 5 },
		start: { x: 0, y: 0 },
		startOrientation: 'E',
		goal: { x: 4, y: 4 },
		layout: {},
		availableBlocks: {
			'move-forward': 'unlimited',
			'turn-left': 'unlimited',
			'turn-right': 'unlimited',
			'loop': 'unlimited'
		},
		maxBlocks: 10
	});

	// Editor State
	mode = $state<'edit' | 'test' | 'story'>('edit');
	activeTool = $state<BuilderTool>({ type: 'terrain', value: 'wall' });
	activeSegmentId = $state<string | null>(null);
	selectedActor = $state<'start' | 'goal' | null>(null);
	
	// The GameModel instance used for rendering (and testing)
	// We recreate it whenever the level definition changes significantly, 
	// or we just mutate it for live preview?
	// For the Grid component to work, it needs a GameModel.
	// Let's keep a live GameModel synced.
	game = $state<GameModel>(new GameModel(this.level));

	constructor() {
		this.syncGame();
	}

	syncGame() {
		// Create a new GameModel with the current level definition
		// We need to ensure we don't lose the reference if components bind to it?
		// Actually, if we use $state for game, Svelte 5 handles the replacement fine.
		this.game = new GameModel(this.level);
	}

	selectActor(actor: 'start' | 'goal' | null) {
		this.selectedActor = actor;
	}

	rotateStartActor() {
		const dirs = ['N', 'E', 'S', 'W'] as const;
		const currentIdx = dirs.indexOf(this.level.startOrientation);
		this.level.startOrientation = dirs[(currentIdx + 1) % 4];
		this.syncGame();
	}

	handleCellClick(pos: GridPosition) {
		if (this.mode !== 'edit') return;

		// If an actor is selected, move it to this position
		if (this.selectedActor) {
			const key = `${pos.x},${pos.y}`;
			const cellType = this.level.layout[key] || 'grass';
			
			// Prevent placing actors on walls or water
			// TODO: Future idea - configurable overlap rules
			if (cellType === 'wall' || cellType === 'water') {
				return;
			}

			if (this.selectedActor === 'start') {
				this.level.start = { ...pos };
			} else if (this.selectedActor === 'goal') {
				this.level.goal = { ...pos };
			}
			// Don't deselect here, let the UI handle drop
			this.syncGame();
			return;
		}

		const key = `${pos.x},${pos.y}`;

		if (this.activeTool.type === 'terrain') {
			// Update layout
			if (this.activeTool.value === 'grass') {
				// Grass is default, remove from layout map
				delete this.level.layout[key];
			} else {
				this.level.layout[key] = this.activeTool.value;
			}
		} else if (this.activeTool.type === 'erase') {
			delete this.level.layout[key];
		}

		// Trigger reactivity by re-assigning or using deep reactivity
		// Since level is a $state object, mutations should trigger updates.
		// However, GameModel copies the level data in its constructor.
		// So we need to update the GameModel's internal state too.
		
		// For now, let's just re-sync the whole game model to be safe and simple.
		// Optimization: Update the specific part of GameModel.
		this.syncGame();
	}
}
