import { GameModel } from './model.svelte';
import { HistoryManager } from './history.svelte';
import type {
	LevelDefinition,
	CellType,
	ItemType,
	GridPosition,
	LevelPack,
	Block,
	Character,
	Emotion
} from './types';
import { persistence, createDefaultPack, type PersistenceService } from './persistence';
import { fileSystem, type FileSystemService } from '$lib/services/file-system';
import { SYSTEM_CHARACTERS, SYSTEM_EMOTIONS } from './constants';

export type BuilderTool =
	| { type: 'terrain'; value: CellType }
	| { type: 'item'; value: ItemType }
	| { type: 'erase' }
	| { type: 'grid' };

export class BuilderModel {
	// The pack we are currently editing
	pack = $state<LevelPack>(createDefaultPack());

	// The ID of the currently active level
	activeLevelId = $state<string>('');

	// Derived level object - this ensures we are always editing the object inside the pack
	get level(): LevelDefinition {
		const found = this.pack.levels.find((l) => l.id === this.activeLevelId);
		if (found) return found;

		// Fallback if ID not found (shouldn't happen if logic is correct)
		if (this.pack.levels.length > 0) return this.pack.levels[0];

		// Absolute fallback
		return {
			id: 'fallback',
			versionId: 'fallback-version',
			vectorClock: {},
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
	isLinked = $state(false);
	needsPermission = $state(false);
	activeTool = $state<BuilderTool>({ type: 'terrain', value: 'wall' });
	activeSegmentId = $state<string | null>(null);
	selectedActor = $state<'start' | 'goal' | null>(null);

	// Targeting State
	targetingState = $state<{
		isActive: boolean;
		contextName: string;
		currentCount: number;
		onToggle: (target: string) => void;
		onClear: () => void;
		onDone: () => void;
	}>({
		isActive: false,
		contextName: '',
		currentCount: 0,
		onToggle: () => {},
		onClear: () => {},
		onDone: () => {}
	});

	targetSelectionContext = $state<string | null>(null);
	hoveredGridPosition = $state<GridPosition | null>(null);
	selectedGridPosition = $state<GridPosition | null>(null);

	// The working program (persisted across mode switches)
	currentProgram = $state<Block[]>([]);

	// Undo/Redo History
	historyManager = new HistoryManager<LevelDefinition>();

	get canUndo() {
		return this.historyManager.canUndo;
	}

	get canRedo() {
		return this.historyManager.canRedo;
	}

	pushState() {
		this.historyManager.pushState($state.snapshot(this.level));
	}

	markModified() {
		const now = Date.now();

		// Provenance Logic (Vector Clock)
		if (!this.level.vectorClock) {
			this.level.vectorClock = {};
		}

		// Get persistent actor ID
		let actorId = 'unknown-actor';
		if (typeof localStorage !== 'undefined') {
			let stored = localStorage.getItem('device_actor_id');
			if (!stored) {
				stored = crypto.randomUUID();
				localStorage.setItem('device_actor_id', stored);
			}
			actorId = stored;
		}

		// Increment clock
		const current = this.level.vectorClock[actorId] || 0;
		this.level.vectorClock[actorId] = current + 1;

		// Generate a new version ID for this state (fast equality check)
		this.level.versionId = crypto.randomUUID();

		// Keep pack updated for sorting/metadata
		this.pack.updated = now;
		this.syncGame();
	}

	undo() {
		const prev = this.historyManager.undo($state.snapshot(this.level));
		if (prev) {
			// Replace current level in pack
			const index = this.pack.levels.findIndex((l) => l.id === this.activeLevelId);
			if (index !== -1) {
				this.pack.levels[index] = prev;
				this.markModified();
			}
		}
	}

	redo() {
		const next = this.historyManager.redo($state.snapshot(this.level));
		if (next) {
			// Replace current level in pack
			const index = this.pack.levels.findIndex((l) => l.id === this.activeLevelId);
			if (index !== -1) {
				this.pack.levels[index] = next;
				this.markModified();
			}
		}
	}

	startInteraction() {
		this.historyManager.startInteraction($state.snapshot(this.level));
	}

	endInteraction() {
		this.historyManager.endInteraction();
	}

	get targetSelectionMode() {
		return this.targetingState.isActive;
	}

	startTargetSelection(
		contextName: string,
		currentCount: number,
		onToggle: (target: string) => void,
		onClear: () => void,
		onDone: () => void
	) {
		this.targetingState = {
			isActive: true,
			contextName,
			currentCount,
			onToggle,
			onClear,
			onDone
		};
	}

	cancelTargetSelection() {
		this.targetingState.isActive = false;
		this.game.clearPersistentHighlight();
	}

	// The GameModel instance used for rendering (and testing)
	game = $state<GameModel>(
		new GameModel({
			id: 'temp',
			name: 'Temp',
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 4 },
			layout: {},
			availableBlocks: {}
		})
	);

	constructor(
		private persistenceService: PersistenceService = persistence,
		private fileSystemService: FileSystemService = fileSystem
	) {
		// Initialize with the first level of the default pack if available,
		// otherwise keep the default new level.
		if (this.pack.levels.length === 0) {
			// Ensure the default level is in the pack
			const defaultLevel: LevelDefinition = {
				id: crypto.randomUUID(),
				versionId: crypto.randomUUID(),
				vectorClock: {},
				name: 'New Level',
				gridSize: { width: 5, height: 5 },
				start: { x: 0, y: 0 },
				startOrientation: 'E',
				goal: { x: 4, y: 4 },
				layout: {},
				customTiles: {},
				availableBlocks: {
					'move-forward': 'unlimited',
					'turn-left': 'unlimited',
					'turn-right': 'unlimited',
					loop: 'unlimited'
				},
				maxBlocks: 10
			};
			this.pack.levels.push(defaultLevel);
		}

		this.activeLevelId = this.pack.levels[0].id;
		this.currentProgram = this.level.initialProgram
			? $state.snapshot(this.level.initialProgram)
			: [];
		this.syncGame();
		this.restoreActiveSegment();

		// Autosave effect
		$effect(() => {
			// Track dependencies
			const packData = $state.snapshot(this.pack);
			this.debouncedSave(packData);
		});

		// Persist active segment
		$effect(() => {
			if (this.activeSegmentId && typeof localStorage !== 'undefined') {
				localStorage.setItem(`lastActiveSegment:${this.activeLevelId}`, this.activeSegmentId);
			}
		});

		// Enforce valid active segment
		$effect(() => {
			const intro = this.level.intro || [];
			const outro = this.level.outro || [];
			const allSegments = [...intro, ...outro];

			// If we have an active segment, check if it still exists
			if (this.activeSegmentId) {
				const exists = allSegments.some((s) => s.id === this.activeSegmentId);
				if (!exists) {
					// Invalid: erase and continue (to the next check)
					this.activeSegmentId = null;
				}
			}

			// If no active segment (or just invalidated), and we have segments, pick the first one
			if (!this.activeSegmentId && allSegments.length > 0) {
				this.activeSegmentId = allSegments[0].id!;
			}
		});
	}

	private saveTimeout: ReturnType<typeof setTimeout> | null = null;

	async init() {
		if (typeof localStorage === 'undefined') return;

		// Try to load last active pack
		const lastId = localStorage.getItem('lastActivePackId');
		if (lastId) {
			// We use this.load() which handles linked packs
			await this.load(lastId);
			if (this.pack.id === lastId) return; // Success
		}

		// Fallback: Load the first available pack
		const packs = await this.persistenceService.listPacks();
		if (packs.length > 0) {
			await this.load(packs[0].id);
		}
		// Else keep the default new pack created in constructor
	}

	async linkToDisk() {
		try {
			await this.fileSystemService.linkPackToDisk(this.pack.id);
			this.isLinked = true;
			this.needsPermission = false;
			// After linking, we should probably save the current state to disk immediately
			await this.fileSystemService.syncPackToDisk(this.pack.id, $state.snapshot(this.pack));
		} catch (err) {
			console.error('Failed to link pack:', err);
			throw err;
		}
	}

	debouncedSave(packData: LevelPack) {
		if (this.saveTimeout) clearTimeout(this.saveTimeout);
		this.saveTimeout = setTimeout(() => {
			this.persistenceService
				.savePack(packData)
				.then(async () => {
					if (typeof localStorage !== 'undefined') {
						localStorage.setItem('lastActivePackId', packData.id);
					}
					// Sync to disk
					try {
						await this.fileSystemService.syncPackToDisk(packData.id, packData);
					} catch (err) {
						console.warn('Failed to sync to disk:', err);
					}
				})
				.catch((err) => console.error('Autosave failed', err));
		}, 1000);
	}

	async save() {
		// Manual save (immediate)
		if (this.saveTimeout) clearTimeout(this.saveTimeout);
		const packData = $state.snapshot(this.pack);
		await this.persistenceService.savePack(packData);

		// Try to sync to disk if linked
		try {
			await this.fileSystemService.syncPackToDisk(packData.id, packData);
		} catch (err) {
			console.warn('Failed to sync to disk:', err);
			throw err;
		}

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('lastActivePackId', this.pack.id);
		}
	}

	async load(packId: string) {
		// Check if linked
		this.isLinked = await this.fileSystemService.isPackLinked(packId);
		this.needsPermission = false;

		// Try to load from disk first if linked
		let loaded: LevelPack | null = null;
		if (this.isLinked) {
			try {
				loaded = await this.fileSystemService.loadLinkedPack(packId);
			} catch (err) {
				console.warn('Failed to load linked pack from disk (likely permission):', err);
				this.needsPermission = true;
			}
		}

		if (!loaded) {
			loaded = await this.persistenceService.loadPack(packId);
		}

		if (loaded) {
			this.setPack(loaded);

			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('lastActivePackId', loaded.id);
			}
		}
	}

	setPack(pack: LevelPack) {
		// Ensure all segments have IDs (migration/fix)
		pack.levels.forEach((level) => {
			level.intro?.forEach((s) => {
				if (!s.id) s.id = crypto.randomUUID();
			});
			level.outro?.forEach((s) => {
				if (!s.id) s.id = crypto.randomUUID();
			});

			// Ensure provenance fields exist
			if (!level.versionId) level.versionId = crypto.randomUUID();
			if (!level.vectorClock) level.vectorClock = {};
		});

		this.pack = pack;
		if (this.pack.levels.length === 0) {
			// Create a default level if pack is empty
			const defaultLevel: LevelDefinition = {
				id: crypto.randomUUID(),
				versionId: crypto.randomUUID(),
				vectorClock: {},
				name: 'New Level',
				gridSize: { width: 5, height: 5 },
				start: { x: 0, y: 0 },
				startOrientation: 'E',
				goal: { x: 4, y: 4 },
				layout: {},
				customTiles: {},
				availableBlocks: {
					'move-forward': 'unlimited',
					'turn-left': 'unlimited',
					'turn-right': 'unlimited',
					loop: 'unlimited'
				},
				maxBlocks: 10
			};
			this.pack.levels.push(defaultLevel);
		}
		this.activeLevelId = this.pack.levels[0].id;
		this.currentProgram = this.level.initialProgram
			? $state.snapshot(this.level.initialProgram)
			: [];
		this.syncGame();
		this.restoreActiveSegment();
	}

	async reconnectDisk() {
		if (!this.isLinked) return;
		// This will trigger permission prompt (must be called from user gesture)
		const loaded = await this.fileSystemService.loadLinkedPack(this.pack.id);
		if (loaded) {
			this.pack = loaded;
			this.needsPermission = false;
			this.syncGame();
		}
	}

	createNewLevel() {
		const newLevel: LevelDefinition = {
			id: crypto.randomUUID(),
			versionId: crypto.randomUUID(),
			vectorClock: {},
			name: `Level ${this.pack.levels.length + 1}`,
			gridSize: { width: 5, height: 5 },
			start: { x: 0, y: 0 },
			startOrientation: 'E',
			goal: { x: 4, y: 4 },
			layout: {},
			customTiles: {},
			availableBlocks: {
				'move-forward': 'unlimited',
				'turn-left': 'unlimited',
				'turn-right': 'unlimited',
				loop: 'unlimited'
			},
			maxBlocks: 10
		};

		this.pack.levels.push(newLevel);
		this.activeLevelId = newLevel.id;
		this.currentProgram = [];
		this.syncGame();
		this.restoreActiveSegment();
	}

	switchLevel(levelId: string) {
		const nextLevel = this.pack.levels.find((l) => l.id === levelId);
		if (nextLevel) {
			this.activeLevelId = nextLevel.id;
			this.currentProgram = this.level.initialProgram
				? $state.snapshot(this.level.initialProgram)
				: [];
			this.syncGame();
			this.restoreActiveSegment();
		}
	}

	setMode(mode: 'edit' | 'test' | 'story') {
		if (this.mode === 'test') {
			// Capture program from test session
			this.currentProgram = $state.snapshot(this.game.program);
		}
		this.mode = mode;

		// Clear selections when switching modes
		this.selectedGridPosition = null;
		this.selectedActor = null;
		// Don't cancel targeting selection when switching modes, so we can target UI elements in Test mode
		// this.cancelTargetSelection();

		this.syncGame();
	}

	ensureCellIds() {
		if (!this.level.cellIds) {
			this.level.cellIds = {};
		}
		const { width, height } = this.level.gridSize;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const key = `${x},${y}`;
				if (!this.level.cellIds[key]) {
					this.level.cellIds[key] = crypto.randomUUID();
				}
			}
		}
	}

	syncGame() {
		this.ensureCellIds();

		// Merge pack tiles into level definition for the game model
		const levelSnapshot = $state.snapshot(this.level);
		const packTiles = $state.snapshot(this.pack.customTiles || {});

		// Level tiles override pack tiles if IDs collide
		levelSnapshot.customTiles = {
			...packTiles,
			...(levelSnapshot.customTiles || {})
		};

		const packItems = $state.snapshot(this.pack.customItems || {});
		levelSnapshot.customItems = {
			...packItems,
			...(levelSnapshot.customItems || {})
		};

		// Merge pack characters (Level overrides Pack by ID)
		const charMap: Record<string, Character> = {};
		SYSTEM_CHARACTERS.forEach((c) => (charMap[c.id] = c));
		(this.pack.characters || []).forEach((c) => (charMap[c.id] = c));
		(levelSnapshot.characters || []).forEach((c) => (charMap[c.id] = c));
		levelSnapshot.characters = Object.values(charMap);

		// Merge pack emotions (Level overrides Pack by ID)
		const emoMap: Record<string, Emotion> = {};
		SYSTEM_EMOTIONS.forEach((e) => (emoMap[e.id] = e));
		(this.pack.emotions || []).forEach((e) => (emoMap[e.id] = e));
		(levelSnapshot.emotions || []).forEach((e) => (emoMap[e.id] = e));
		levelSnapshot.emotions = Object.values(emoMap);

		// Create a new GameModel with the current level definition
		this.game = new GameModel(levelSnapshot);
		// Restore the working program
		this.game.program = $state.snapshot(this.currentProgram);
	}

	selectActor(actor: 'start' | 'goal' | null) {
		this.selectedActor = actor;
	}

	rotateStartActor() {
		this.pushState();
		const dirs = ['N', 'E', 'S', 'W'] as const;
		const currentIdx = dirs.indexOf(this.level.startOrientation);
		this.level.startOrientation = dirs[(currentIdx + 1) % 4];
		this.markModified();
	}

	// Function Management
	createFunction(name: string) {
		if (!this.level.functions) {
			this.level.functions = {};
		}
		if (this.level.functions[name]) return; // Already exists

		this.pushState();
		this.level.functions[name] = [];
		this.markModified();
	}

	deleteFunction(name: string) {
		if (!this.level.functions) return;
		this.pushState();
		delete this.level.functions[name];
		this.markModified();
	}

	editFunction(name: string) {
		this.game.editingContext = name;
	}

	closeFunctionEditor() {
		this.game.editingContext = null;
		// Sync back to level definition
		if (this.level.functions) {
			this.level.functions = $state.snapshot(this.game.functions);
		}
	}

	snapshotTray() {
		// Save the current program from the game model to the level definition
		// Since game.program is synced with currentProgram in Edit mode, this works.
		this.level.initialProgram = $state.snapshot(this.game.program);
		// Also save functions if we want to support pre-filled functions
		this.level.functions = $state.snapshot(this.game.functions);
	}

	toggleStoryHighlight(target: string) {
		if (!this.activeSegmentId) return;

		const findAndToggle = (list: import('./types').StorySegment[] | undefined) => {
			if (!list) return false;
			const segment = list.find((s) => s.id === this.activeSegmentId);
			if (segment) {
				if (!segment.targets) segment.targets = [];

				const index = segment.targets.indexOf(target);
				if (index !== -1) {
					segment.targets.splice(index, 1);
				} else {
					segment.targets.push(target);
				}

				// Trigger preview with ALL targets
				if (this.targetingState.isActive) {
					this.game.setPersistentHighlight(segment.targets);
				} else {
					this.game.triggerPreviewHighlight(segment.targets);
				}
				return true;
			}
			return false;
		};

		if (!findAndToggle(this.level.intro)) {
			findAndToggle(this.level.outro);
		}
	}

	restoreActiveSegment() {
		if (typeof window === 'undefined') return;

		const savedId = localStorage.getItem(`lastActiveSegment:${this.activeLevelId}`);

		// Helper to check existence
		const exists = (id: string) => {
			return (
				this.level.intro?.some((s) => s.id === id) || this.level.outro?.some((s) => s.id === id)
			);
		};

		if (savedId && exists(savedId)) {
			this.activeSegmentId = savedId;
			return;
		}

		// Default to first available
		if (this.level.intro && this.level.intro.length > 0) {
			this.activeSegmentId = this.level.intro[0].id!;
		} else if (this.level.outro && this.level.outro.length > 0) {
			this.activeSegmentId = this.level.outro[0].id!;
		} else {
			this.activeSegmentId = null;
		}
	}

	resizeGrid(dWidth: number, dHeight: number) {
		const newWidth = Math.max(3, Math.min(10, this.level.gridSize.width + dWidth));
		const newHeight = Math.max(3, Math.min(10, this.level.gridSize.height + dHeight));

		if (newWidth !== this.level.gridSize.width || newHeight !== this.level.gridSize.height) {
			this.pushState();
			this.level.gridSize = { width: newWidth, height: newHeight };
			this.markModified();
		}
	}

	addColumn(side: 'left' | 'right') {
		if (this.level.gridSize.width >= 10) return;

		this.pushState();
		this.level.gridSize.width++;

		if (side === 'left') {
			// Shift everything right by 1
			const newLayout: Record<string, CellType> = {};
			const newCellIds: Record<string, string> = {};

			for (const [key, type] of Object.entries(this.level.layout)) {
				const [x, y] = key.split(',').map(Number);
				newLayout[`${x + 1},${y}`] = type;
			}

			if (this.level.cellIds) {
				for (const [key, id] of Object.entries(this.level.cellIds)) {
					const [x, y] = key.split(',').map(Number);
					newCellIds[`${x + 1},${y}`] = id;
				}
			}

			this.level.layout = newLayout;
			this.level.cellIds = newCellIds;

			// Shift actors
			this.level.start.x++;
			this.level.goal.x++;
		}
		this.markModified();
	}

	addRow(side: 'top' | 'bottom') {
		if (this.level.gridSize.height >= 10) return;

		this.pushState();
		this.level.gridSize.height++;

		if (side === 'top') {
			// Shift everything down by 1
			const newLayout: Record<string, CellType> = {};
			const newCellIds: Record<string, string> = {};

			for (const [key, type] of Object.entries(this.level.layout)) {
				const [x, y] = key.split(',').map(Number);
				newLayout[`${x},${y + 1}`] = type;
			}

			if (this.level.cellIds) {
				for (const [key, id] of Object.entries(this.level.cellIds)) {
					const [x, y] = key.split(',').map(Number);
					newCellIds[`${x},${y + 1}`] = id;
				}
			}

			this.level.layout = newLayout;
			this.level.cellIds = newCellIds;

			// Shift actors
			this.level.start.y++;
			this.level.goal.y++;
		}
		this.markModified();
	}

	removeColumn(index: number) {
		if (this.level.gridSize.width <= 3) return;

		this.pushState();
		// Remove cells in this column
		const newLayout: Record<string, CellType> = {};
		const newCellIds: Record<string, string> = {};

		for (const [key, type] of Object.entries(this.level.layout)) {
			const [x, y] = key.split(',').map(Number);
			if (x === index) continue; // Delete
			if (x > index) {
				newLayout[`${x - 1},${y}`] = type; // Shift left
			} else {
				newLayout[key] = type; // Keep
			}
		}

		if (this.level.cellIds) {
			for (const [key, id] of Object.entries(this.level.cellIds)) {
				const [x, y] = key.split(',').map(Number);
				if (x === index) continue; // Delete
				if (x > index) {
					newCellIds[`${x - 1},${y}`] = id; // Shift left
				} else {
					newCellIds[key] = id; // Keep
				}
			}
		}

		this.level.layout = newLayout;
		this.level.cellIds = newCellIds;

		// Adjust actors
		if (this.level.start.x === index) this.level.start.x = Math.max(0, index - 1);
		else if (this.level.start.x > index) this.level.start.x--;

		if (this.level.goal.x === index) this.level.goal.x = Math.max(0, index - 1);
		else if (this.level.goal.x > index) this.level.goal.x--;

		this.level.gridSize.width--;
		this.markModified();
	}

	removeRow(index: number) {
		if (this.level.gridSize.height <= 3) return;

		this.pushState();
		// Remove cells in this row
		const newLayout: Record<string, CellType> = {};
		const newCellIds: Record<string, string> = {};

		for (const [key, type] of Object.entries(this.level.layout)) {
			const [x, y] = key.split(',').map(Number);
			if (y === index) continue; // Delete
			if (y > index) {
				newLayout[`${x},${y - 1}`] = type; // Shift up
			} else {
				newLayout[key] = type; // Keep
			}
		}

		if (this.level.cellIds) {
			for (const [key, id] of Object.entries(this.level.cellIds)) {
				const [x, y] = key.split(',').map(Number);
				if (y === index) continue; // Delete
				if (y > index) {
					newCellIds[`${x},${y - 1}`] = id; // Shift up
				} else {
					newCellIds[key] = id; // Keep
				}
			}
		}

		this.level.layout = newLayout;
		this.level.cellIds = newCellIds;

		// Adjust actors
		if (this.level.start.y === index) this.level.start.y = Math.max(0, index - 1);
		else if (this.level.start.y > index) this.level.start.y--;

		if (this.level.goal.y === index) this.level.goal.y = Math.max(0, index - 1);
		else if (this.level.goal.y > index) this.level.goal.y--;

		this.level.gridSize.height--;
		this.markModified();
	}

	handleCellClick(pos: GridPosition) {
		if (this.mode !== 'edit') return;

		if (this.targetingState.isActive) {
			const key = `${pos.x},${pos.y}`;
			const id = this.level.cellIds?.[key];
			const target = id ? id : `cell:${pos.x},${pos.y}`;
			this.targetingState.onToggle(target);
			return;
		}

		this.startInteraction();

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
			this.markModified();
			return;
		}

		const key = `${pos.x},${pos.y}`;

		if (this.activeTool.type === 'grid') {
			// Toggle selection
			if (
				this.selectedGridPosition &&
				this.selectedGridPosition.x === pos.x &&
				this.selectedGridPosition.y === pos.y
			) {
				this.selectedGridPosition = null;
			} else {
				this.selectedGridPosition = pos;
			}
			return;
		}

		if (this.activeTool.type === 'terrain') {
			const defaultTerrain = this.level.defaultTerrain || 'grass';
			// Update layout
			if (this.activeTool.value === defaultTerrain) {
				// If painting the default terrain, remove from layout map (optimization)
				delete this.level.layout[key];
			} else {
				this.level.layout[key] = this.activeTool.value;
			}
		} else if (this.activeTool.type === 'item') {
			if (!this.level.items) this.level.items = {};

			let icon = this.activeTool.value;
			// Try to find definition
			const def =
				this.level.customItems?.[this.activeTool.value] ||
				this.pack.customItems?.[this.activeTool.value];
			if (def) {
				icon = def.visuals.icon;
			} else {
				// Built-ins
				if (this.activeTool.value === 'boat') icon = 'Ship';
				if (this.activeTool.value === 'key') icon = 'Key';
				if (this.activeTool.value === 'number') icon = 'Hash';
				if (this.activeTool.value === 'color') icon = 'Palette';
			}

			this.level.items[key] = {
				type: this.activeTool.value,
				value: true,
				icon: icon
			};
		} else if (this.activeTool.type === 'erase') {
			delete this.level.layout[key];
			if (this.level.items) {
				delete this.level.items[key];
			}
		}

		// Trigger reactivity by re-assigning or using deep reactivity
		// Since level is a $state object, mutations should trigger updates.
		// However, GameModel copies the level data in its constructor.
		// So we need to update the GameModel's internal state too.

		// For now, let's just re-sync the whole game model to be safe and simple.
		// Optimization: Update the specific part of GameModel.
		this.markModified();
	}
}
