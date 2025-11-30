import { describe, it, expect } from 'vitest';
import { countBlocks, hasSequence, detectAntiPatterns } from './analysis';
import type { Block } from './schema';

// Helper to create blocks easily
const b = (type: Block['type'], children?: Block[]): Block => ({
	id: crypto.randomUUID(),
	type,
	children
});

describe('Program Analysis', () => {
	describe('countBlocks', () => {
		it('counts top-level blocks', () => {
			const program = [b('move-forward'), b('turn-left'), b('move-forward')];
			expect(countBlocks(program, 'move-forward')).toBe(2);
			expect(countBlocks(program, 'turn-left')).toBe(1);
			expect(countBlocks(program, 'turn-right')).toBe(0);
		});

		it('counts nested blocks', () => {
			const program = [
				b('move-forward'),
				b('loop', [b('move-forward'), b('turn-left')]),
				b('move-forward')
			];
			expect(countBlocks(program, 'move-forward')).toBe(3);
			expect(countBlocks(program, 'turn-left')).toBe(1);
			expect(countBlocks(program, 'loop')).toBe(1);
		});
	});

	describe('hasSequence', () => {
		it('detects simple sequences', () => {
			const program = [b('move-forward'), b('turn-left'), b('move-forward')];
			expect(hasSequence(program, ['move-forward', 'turn-left'])).toBe(true);
			expect(hasSequence(program, ['turn-left', 'move-forward'])).toBe(true);
			expect(hasSequence(program, ['move-forward', 'move-forward'])).toBe(false);
		});

		it('detects sequences inside loops', () => {
			const program = [
				b('move-forward'),
				b('loop', [b('move-forward'), b('turn-left'), b('move-forward')])
			];
			expect(hasSequence(program, ['move-forward', 'turn-left'])).toBe(true); // Inside loop
			expect(hasSequence(program, ['loop', 'move-forward'])).toBe(false); // Not contiguous at same level
		});

		it('does not match across nesting boundaries', () => {
			const program = [b('move-forward'), b('loop', [b('turn-left')])];
			// 'move-forward' is followed by 'loop', but the content of loop is 'turn-left'.
			// hasSequence checks for contiguous blocks in the list.
			expect(hasSequence(program, ['move-forward', 'turn-left'])).toBe(false);
		});
	});

	describe('detectAntiPatterns', () => {
		it('detects redundant turns', () => {
			const program = [b('move-forward'), b('turn-left'), b('turn-right'), b('move-forward')];
			expect(detectAntiPatterns(program)).toContain('redundant-turn');
		});

		it('detects 360 turns', () => {
			const program = [
				b('turn-left'),
				b('turn-left'),
				b('turn-left'),
				b('turn-left'),
				b('move-forward')
			];
			expect(detectAntiPatterns(program)).toContain('360-turn');
		});

		it('detects empty loops', () => {
			const program = [b('move-forward'), b('loop', [])];
			expect(detectAntiPatterns(program)).toContain('empty-loop');
		});

		it('detects missed loops (simple case)', () => {
			const program = [
				b('move-forward'),
				b('move-forward'),
				b('move-forward'),
				b('move-forward'),
				b('move-forward')
			];
			expect(detectAntiPatterns(program)).toContain('missed-loop');
		});

		it('detects missing function calls', () => {
			const program = [b('move-forward')];
			const functions = {
				Jump: [b('move-forward'), b('move-forward')]
			};
			expect(detectAntiPatterns(program, functions)).toContain('missing-call:Jump');
		});

		it('does not report missing call if function is called', () => {
			const program = [
				b('move-forward'),
				{ id: '1', type: 'call', functionName: 'Jump' } as Block
			];
			const functions = {
				Jump: [b('move-forward'), b('move-forward')]
			};
			expect(detectAntiPatterns(program, functions)).not.toContain('missing-call:Jump');
		});

		it('does not report missing call if function is empty', () => {
			const program = [b('move-forward')];
			const functions = {
				Jump: []
			};
			expect(detectAntiPatterns(program, functions)).not.toContain('missing-call:Jump');
		});
	});
});
