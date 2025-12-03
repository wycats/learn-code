import { describe, it, expect } from 'vitest';
import { HistoryManager } from './history.svelte';

describe('HistoryManager', () => {
	it('should initialize with empty history and future', () => {
		const history = new HistoryManager<number>();
		expect(history.history).toEqual([]);
		expect(history.future).toEqual([]);
		expect(history.canUndo).toBe(false);
		expect(history.canRedo).toBe(false);
	});

	it('should push state to history', () => {
		const history = new HistoryManager<number>();
		history.pushState(1);
		expect(history.history).toEqual([1]);
		expect(history.canUndo).toBe(true);
		expect(history.canRedo).toBe(false);
	});

	it('should undo state', () => {
		const history = new HistoryManager<number>();
		history.pushState(1); // History: [1]

		// Current state is 2. Undo should return 1 and push 2 to future.
		const newState = history.undo(2);

		expect(newState).toBe(1);
		expect(history.history).toEqual([]);
		expect(history.future).toEqual([2]);
		expect(history.canUndo).toBe(false);
		expect(history.canRedo).toBe(true);
	});

	it('should redo state', () => {
		const history = new HistoryManager<number>();
		history.pushState(1); // History: [1]
		history.undo(2); // History: [], Future: [2], Current: 1

		// Current state is 1. Redo should return 2 and push 1 to history.
		const newState = history.redo(1);

		expect(newState).toBe(2);
		expect(history.history).toEqual([1]);
		expect(history.future).toEqual([]);
		expect(history.canUndo).toBe(true);
		expect(history.canRedo).toBe(false);
	});

	it('should clear future on pushState', () => {
		const history = new HistoryManager<number>();
		history.pushState(1);
		history.undo(2); // Future has [2]

		history.pushState(3); // Should clear future
		expect(history.future).toEqual([]);
		expect(history.history).toEqual([3]);
	});

	it('should limit history size', () => {
		const history = new HistoryManager<number>();
		history.maxHistory = 2;

		history.pushState(1);
		history.pushState(2);
		history.pushState(3);

		expect(history.history).toEqual([2, 3]);
		expect(history.history.length).toBe(2);
	});

	it('should handle interaction grouping', () => {
		const history = new HistoryManager<number>();

		// First interaction
		history.startInteraction(1);
		history.startInteraction(1); // Should be ignored
		history.endInteraction();

		expect(history.history).toEqual([1]);

		// Second interaction
		history.startInteraction(2);
		history.endInteraction();

		expect(history.history).toEqual([1, 2]);
	});

	it('should clear history', () => {
		const history = new HistoryManager<number>();
		history.pushState(1);
		history.undo(2);
		history.clear();

		expect(history.history).toEqual([]);
		expect(history.future).toEqual([]);
		expect(history.isInteracting).toBe(false);
	});
});
