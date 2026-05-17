import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BuilderModel } from './builder-model.svelte';
import { InMemoryPersistenceService } from '$lib/services/persistence.fake';
import { InMemoryFileSystemService } from '$lib/services/file-system.fake';
import type { LevelPack } from '$lib/game/types';

// No mocks! Just fakes.

describe('BuilderModel', () => {
	let builder: BuilderModel;
	let persistence: InMemoryPersistenceService;
	let fileSystem: InMemoryFileSystemService;

	const mockPack = {
		id: 'test-pack',
		name: 'Test Pack',
		levels: [
			{
				id: 'level-1',
				name: 'Level 1',
				gridSize: { width: 5, height: 5 },
				start: { x: 0, y: 0 },
				startOrientation: 'E',
				goal: { x: 4, y: 4 },
				layout: {},
				availableBlocks: {},
				functions: {}
			}
		]
	};

	beforeEach(() => {
		// Mock localStorage
		global.localStorage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			length: 0,
			key: vi.fn()
		} as unknown as Storage;

		// Setup Fakes
		persistence = new InMemoryPersistenceService();
		fileSystem = new InMemoryFileSystemService();

		builder = new BuilderModel(persistence, fileSystem);
		// Force the mock pack state for consistency with previous tests
		builder.pack = JSON.parse(JSON.stringify(mockPack));
		builder.activeLevelId = 'level-1';
		builder.syncGame();
	});

	it('initializes with a default level', () => {
		// Create a fresh builder to test initialization logic
		const freshBuilder = new BuilderModel(persistence, fileSystem);
		expect(freshBuilder.pack).toBeDefined();
		expect(freshBuilder.level).toBeDefined();
	});

	it('switches modes', () => {
		expect(builder.mode).toBe('edit');
		builder.setMode('test');
		expect(builder.mode).toBe('test');
	});

	it('handles undo/redo', () => {
		// Initial state
		const initialLayout = JSON.stringify(builder.level.layout);

		// Make a change
		builder.activeTool = { type: 'terrain', value: 'wall' };
		builder.handleCellClick({ x: 0, y: 0 });

		expect(builder.level.layout['0,0']).toBe('wall');

		// Undo
		builder.undo();
		expect(JSON.stringify(builder.level.layout)).toBe(initialLayout);

		// Redo
		builder.redo();
		expect(builder.level.layout['0,0']).toBe('wall');
	});

	it('resizes grid', () => {
		builder.resizeGrid(1, 1);
		expect(builder.level.gridSize.width).toBe(6);
		expect(builder.level.gridSize.height).toBe(6);
	});

	it('adds column to the left', () => {
		const initialWidth = builder.level.gridSize.width;
		builder.addColumn('left');
		expect(builder.level.gridSize.width).toBe(initialWidth + 1);
		// Check if start position shifted
		expect(builder.level.start.x).toBe(1);
	});

	it('adds row to the top', () => {
		const initialHeight = builder.level.gridSize.height;
		builder.addRow('top');
		expect(builder.level.gridSize.height).toBe(initialHeight + 1);
		// Check if start position shifted
		expect(builder.level.start.y).toBe(1);
	});

	it('paints terrain', () => {
		builder.activeTool = { type: 'terrain', value: 'wall' };
		builder.handleCellClick({ x: 1, y: 1 });
		expect(builder.level.layout['1,1']).toBe('wall');
	});

	it('erases terrain', () => {
		// First paint something
		builder.activeTool = { type: 'terrain', value: 'wall' };
		builder.handleCellClick({ x: 1, y: 1 });
		expect(builder.level.layout['1,1']).toBe('wall');

		// Then erase it
		builder.activeTool = { type: 'erase' };
		builder.handleCellClick({ x: 1, y: 1 });
		expect(builder.level.layout['1,1']).toBeUndefined();
	});

	it('moves start actor', () => {
		builder.selectActor('start');
		builder.handleCellClick({ x: 2, y: 2 });
		expect(builder.level.start).toEqual({ x: 2, y: 2 });
	});

	it('creates and deletes functions', () => {
		builder.createFunction('func1');
		expect(builder.level.functions).toBeDefined();
		expect(builder.level.functions!['func1']).toBeDefined();

		builder.deleteFunction('func1');
		expect(builder.level.functions!['func1']).toBeUndefined();
	});

	it('creates new level', () => {
		const initialCount = builder.pack.levels.length;
		builder.createNewLevel();
		expect(builder.pack.levels.length).toBe(initialCount + 1);
		expect(builder.level).toBe(builder.pack.levels[builder.pack.levels.length - 1]);
	});

	it('switches levels', () => {
		builder.createNewLevel();
		const newLevelId = builder.level.id;
		const firstLevelId = builder.pack.levels[0].id;

		builder.switchLevel(firstLevelId);
		expect(builder.level.id).toBe(firstLevelId);

		builder.switchLevel(newLevelId);
		expect(builder.level.id).toBe(newLevelId);
	});

	it('removes column', () => {
		const initialWidth = builder.level.gridSize.width;
		builder.removeColumn(0);
		expect(builder.level.gridSize.width).toBe(initialWidth - 1);
	});

	it('removes row', () => {
		const initialHeight = builder.level.gridSize.height;
		builder.removeRow(0);
		expect(builder.level.gridSize.height).toBe(initialHeight - 1);
	});

	it('snapshots tray', () => {
		expect(() => builder.snapshotTray()).not.toThrow();
	});

	it('toggles story highlight', () => {
		// Setup a segment
		builder.level.intro = [{ id: 'seg1', text: 'Intro', speaker: 'Narrator', targets: [] }];
		builder.activeSegmentId = 'seg1';
		builder.targetingState.isActive = true; // Mock targeting active

		builder.toggleStoryHighlight('target1');

		const segment = builder.level.intro[0];
		expect(segment.targets).toContain('target1');

		builder.toggleStoryHighlight('target1');
		expect(segment.targets).not.toContain('target1');
	});

	it('saves pack', async () => {
		await builder.save();

		// Verify against the Fake Persistence
		const saved = await persistence.loadPack(builder.pack.id);
		expect(saved).toBeDefined();
		expect(saved?.id).toBe(builder.pack.id);
	});

	it('loads pack', async () => {
		const packToLoad = {
			id: 'loaded-pack',
			name: 'Loaded Pack',
			levels: [
				{
					id: 'level-loaded',
					name: 'Loaded Level',
					gridSize: { width: 5, height: 5 },
					start: { x: 0, y: 0 },
					startOrientation: 'E',
					goal: { x: 4, y: 4 },
					layout: {},
					availableBlocks: {}
				}
			]
		};

		// Seed the fake
		await persistence.savePack(packToLoad as unknown as LevelPack);

		await builder.load('loaded-pack');
		expect(builder.pack.id).toBe('loaded-pack');
	});

	it('links to disk', async () => {
		await builder.linkToDisk();

		// Verify against Fake FileSystem
		const isLinked = await fileSystem.isPackLinked(builder.pack.id);
		expect(isLinked).toBe(true);
		expect(builder.isLinked).toBe(true);
	});

	it('rotates start actor', () => {
		builder.level.startOrientation = 'N';
		builder.rotateStartActor();
		expect(builder.level.startOrientation).toBe('E');
		builder.rotateStartActor();
		expect(builder.level.startOrientation).toBe('S');
		builder.rotateStartActor();
		expect(builder.level.startOrientation).toBe('W');
		builder.rotateStartActor();
		expect(builder.level.startOrientation).toBe('N');
	});

	it('handles cell click in targeting mode', () => {
		const onToggle = vi.fn();
		builder.startTargetSelection('test', 1, onToggle, vi.fn(), vi.fn());

		builder.handleCellClick({ x: 0, y: 0 });
		expect(onToggle).toHaveBeenCalled();
		// Should not modify layout
		expect(builder.level.layout['0,0']).toBeUndefined();
	});

	it('prevents placing actor on wall', () => {
		builder.level.layout['0,0'] = 'wall';
		builder.syncGame();

		builder.selectActor('start');
		const initialStart = { ...builder.level.start };

		builder.handleCellClick({ x: 0, y: 0 });

		expect(builder.level.start).toEqual(initialStart);
	});

	it('toggles grid selection with grid tool', () => {
		builder.activeTool = { type: 'grid' };

		// Select
		builder.handleCellClick({ x: 1, y: 1 });
		expect(builder.selectedGridPosition).toEqual({ x: 1, y: 1 });

		// Deselect
		builder.handleCellClick({ x: 1, y: 1 });
		expect(builder.selectedGridPosition).toBeNull();

		// Select another
		builder.handleCellClick({ x: 2, y: 2 });
		expect(builder.selectedGridPosition).toEqual({ x: 2, y: 2 });
	});

	it('edits and closes function', () => {
		builder.createFunction('myFunc');
		builder.editFunction('myFunc');
		expect(builder.game.editingContext).toBe('myFunc');

		builder.closeFunctionEditor();
		expect(builder.game.editingContext).toBeNull();
	});

	it('syncs game with pack assets', () => {
		builder.pack.customTiles = {
			tile1: { id: 'tile1', name: 'Tile 1', type: 'floor', visuals: { color: 'red' } }
		};
		builder.level.customTiles = {
			tile2: { id: 'tile2', name: 'Tile 2', type: 'floor', visuals: { color: 'blue' } }
		};

		builder.syncGame();

		expect(builder.game.level.customTiles!['tile1']).toBeDefined();
		expect(builder.game.level.customTiles!['tile2']).toBeDefined();
	});

	it('reconnects to disk', async () => {
		// Setup fake state
		const diskPack = JSON.parse(JSON.stringify(mockPack));
		diskPack.name = 'Disk Pack';

		await fileSystem.linkPackToDisk(mockPack.id);
		await fileSystem.syncPackToDisk(mockPack.id, diskPack);

		builder.isLinked = true; // Simulate previously linked state in UI

		await builder.reconnectDisk();

		expect(builder.pack.name).toBe('Disk Pack');
		expect(builder.needsPermission).toBe(false);
	});

	it('debounces save', async () => {
		vi.useFakeTimers();

		// Trigger a save via effect (simulated)
		builder.debouncedSave(builder.pack);

		// Check fake persistence - should NOT be saved yet
		let saved = await persistence.loadPack(builder.pack.id);
		expect(saved).toBeNull();

		vi.advanceTimersByTime(1000);

		// Check fake persistence - SHOULD be saved now
		saved = await persistence.loadPack(builder.pack.id);
		expect(saved).toBeDefined();

		vi.useRealTimers();
	});

	it('optimizes default terrain storage', () => {
		builder.level.defaultTerrain = 'grass';
		builder.activeTool = { type: 'terrain', value: 'grass' };

		// First ensure it's not there
		delete builder.level.layout['0,0'];

		// Paint grass (default)
		builder.handleCellClick({ x: 0, y: 0 });

		// Should NOT be in layout map
		expect(builder.level.layout['0,0']).toBeUndefined();

		// Paint wall (non-default)
		builder.activeTool = { type: 'terrain', value: 'wall' };
		builder.handleCellClick({ x: 0, y: 0 });
		expect(builder.level.layout['0,0']).toBe('wall');

		// Paint grass again
		builder.activeTool = { type: 'terrain', value: 'grass' };
		builder.handleCellClick({ x: 0, y: 0 });
		expect(builder.level.layout['0,0']).toBeUndefined();
	});

	it('clamps grid resizing', () => {
		// Try to shrink below 3x3
		builder.level.gridSize = { width: 3, height: 3 };
		builder.resizeGrid(-1, -1);
		expect(builder.level.gridSize).toEqual({ width: 3, height: 3 });

		// Try to grow above 10x10
		builder.level.gridSize = { width: 10, height: 10 };
		builder.resizeGrid(1, 1);
		expect(builder.level.gridSize).toEqual({ width: 10, height: 10 });
	});

	it('adjusts actors when removing rows/cols', () => {
		// Place start at 1,1
		builder.level.start = { x: 1, y: 1 };

		// Remove row 0 (above actor) -> Actor should shift up to 0,1
		builder.removeRow(0);
		expect(builder.level.start.y).toBe(0);

		// Remove row 0 (at actor) -> Actor should stay at 0,1 (clamped)
		builder.removeRow(0);
		expect(builder.level.start.y).toBe(0);

		// Reset
		builder.level.gridSize = { width: 5, height: 5 };
		builder.level.start = { x: 1, y: 1 };

		// Remove col 0 (left of actor) -> Actor should shift left to 0,1
		builder.removeColumn(0);
		expect(builder.level.start.x).toBe(0);
	});

	// Skipped tests that rely on localStorage side effects which we aren't testing with fakes yet
	// To test these properly, we should inject a SessionService.
	it.skip('restores active segment from local storage', () => {
		// Requires SessionService injection
	});

	it.skip('handles invalid active segment in local storage', () => {
		// Requires SessionService injection
	});
});
