import { GameModel } from './model.svelte';
import type { LevelDefinition, CellType, GridPosition, LevelPack } from './types';
import { createDefaultPack, savePack, loadPack, listPacks } from './persistence';

export type BuilderTool = 
	| { type: 'terrain'; value: CellType }
	| { type: 'erase' };

export class BuilderModel {
	// The pack we are currently editing
	pack = $state<LevelPack>(createDefaultPack());
	
	// The ID of the currently active level
	activeLevelId = $state<string>('');

	// Derived level object - this ensures we are always editing the object inside the pack
	get level(): LevelDefinition {
		const found = this.pack.levels.find(l => l.id === this.activeLevelId);
		if (found) return found;
		
		// Fallback if ID not found (shouldn't happen if logic is correct)
		if (this.pack.levels.length > 0) return this.pack.levels[0];
		
		// Absolute fallback
		return {
			id: 'fallback',
			name: 'Fallback Level',
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 4 },
			layout: {},
			availableBlocks: {},
			maxBlocks: 10
		};
	}

	// Editor State
	mode = $state<'edit' | 'test' | 'story'>('edit');
	activeTool = $state<BuilderTool>({ type: 'terrain', value: 'wall' });
	activeSegmentId = $state<string | null>(null);
	selectedActor = $state<'start' | 'goal' | null>(null);
	
	// The GameModel instance used for rendering (and testing)
	game = $state<GameModel>(new GameModel({
		id: 'temp',
		name: 'Temp',
		gridSize: { width: 5, height: 5 },
		start: { x: 0, y: 0 },
		startOrientation: 'E',
		goal: { x: 4, y: 4 },
		layout: {},
		availableBlocks: {}
	}));

	constructor() {
		// Initialize with the first level of the default pack if available, 
		// otherwise keep the default new level.
		if (this.pack.levels.length === 0) {
			// Ensure the default level is in the pack
			const defaultLevel: LevelDefinition = {
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
			};
			this.pack.levels.push(defaultLevel);
		}
		
		this.activeLevelId = this.pack.levels[0].id;
		this.syncGame();

		// Autosave effect
		$effect(() => {
			// Track dependencies
			const packData = $state.snapshot(this.pack);
			this.debouncedSave(packData);
		});
	}

	private saveTimeout: ReturnType<typeof setTimeout> | null = null;

	async init() {
		if (typeof localStorage === 'undefined') return;

		// Try to load last active pack
		const lastId = localStorage.getItem('lastActivePackId');
		if (lastId) {
			const pack = await loadPack(lastId);
			if (pack) {
				this.pack = pack;
				if (this.pack.levels.length > 0) {
					this.activeLevelId = this.pack.levels[0].id;
				}
				this.syncGame();
				return;
			}
		}

		// Fallback: Load the first available pack
		const packs = await listPacks();
		if (packs.length > 0) {
			await this.load(packs[0].id);
		}
		// Else keep the default new pack created in constructor
	}

	debouncedSave(packData: LevelPack) {
		if (this.saveTimeout) clearTimeout(this.saveTimeout);
		this.saveTimeout = setTimeout(() => {
			savePack(packData)
				.then(() => {
					if (typeof localStorage !== 'undefined') {
						localStorage.setItem('lastActivePackId', packData.id);
					}
				})
				.catch((err) => console.error('Autosave failed', err));
		}, 1000);
	}

	async save() {
		// Manual save (immediate)
		if (this.saveTimeout) clearTimeout(this.saveTimeout);
		await savePack($state.snapshot(this.pack));
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('lastActivePackId', this.pack.id);
		}
	}

	async load(packId: string) {
		const loaded = await loadPack(packId);
		if (loaded) {
			this.pack = loaded;
			if (this.pack.levels.length === 0) {
				// Create a default level if pack is empty
				const defaultLevel: LevelDefinition = {
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
				};
				this.pack.levels.push(defaultLevel);
			}
			this.activeLevelId = this.pack.levels[0].id;
			this.syncGame();
			
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('lastActivePackId', loaded.id);
			}
		}
	}

	createNewLevel() {
		const newLevel: LevelDefinition = {
			id: crypto.randomUUID(),
			name: `Level ${this.pack.levels.length + 1}`,
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
		};
		
		this.pack.levels.push(newLevel);
		this.activeLevelId = newLevel.id;
		this.syncGame();
	}

	switchLevel(levelId: string) {
		const nextLevel = this.pack.levels.find(l => l.id === levelId);
		if (nextLevel) {
			this.activeLevelId = nextLevel.id;
			this.syncGame();
		}
	}

	setMode(mode: 'edit' | 'test' | 'story') {
		this.mode = mode;
		this.syncGame();
	}

	syncGame() {
		// Create a new GameModel with the current level definition
		this.game = new GameModel($state.snapshot(this.level));
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
		if (this.mode !== 'edit' && this.mode !== 'story') return;

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
			const defaultTerrain = this.level.defaultTerrain || 'grass';
			// Update layout
			if (this.activeTool.value === defaultTerrain) {
				// If painting the default terrain, remove from layout map (optimization)
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
