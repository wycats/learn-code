import { describe, expect, it } from 'vitest';
import { formatProgramCode, formatProgramCodeWithMap } from './codegen';
import type { Block } from './types';

function block(id: string, type: Block['type'], extra: Partial<Block> = {}): Block {
	return { id, type, ...extra };
}

describe('formatProgramCode', () => {
	it('formats an empty program', () => {
		expect(formatProgramCode({ program: [] })).toBe(
			'// Add blocks to start building your program.'
		);
	});

	it('formats movement, turn, pickup, and board blocks', () => {
		const code = formatProgramCode({
			program: [
				block('move', 'move-forward'),
				block('left', 'turn-left'),
				block('right', 'turn-right'),
				block('pickup', 'pick-up'),
				block('board', 'board')
			]
		});

		expect(code).toBe(
			['moveForward();', 'turnLeft();', 'turnRight();', 'pickUp();', 'board();'].join('\n')
		);
	});

	it('formats numeric, held-item, and forever repeats', () => {
		const code = formatProgramCode({
			program: [
				block('repeat-3', 'loop', {
					count: 3,
					children: [block('move', 'move-forward')]
				}),
				block('repeat-held', 'loop', {
					count: { type: 'variable', variableId: 'heldItem' },
					children: [block('pickup', 'pick-up')]
				}),
				block('repeat-forever', 'loop', {
					children: []
				})
			]
		});

		expect(code).toBe(
			[
				'repeat(3, () => {',
				'  moveForward();',
				'});',
				'repeat(heldItem, () => {',
				'  pickUp();',
				'});',
				'repeatForever(() => {',
				'  // Add blocks to start building your program.',
				'});'
			].join('\n')
		);
	});

	it('formats function definitions and calls with quoted names', () => {
		const code = formatProgramCode({
			program: [
				block('call-a', 'call', { functionName: 'Turn Around' }),
				block('call-empty', 'call')
			],
			functions: {
				'Turn Around': [block('left-1', 'turn-left'), block('left-2', 'turn-left')],
				'123 tricky-name': []
			}
		});

		expect(code).toBe(
			[
				'callFunction("Turn Around");',
				'callFunction(/* choose a function */);',
				'',
				'defineFunction("Turn Around", () => {',
				'  turnLeft();',
				'  turnLeft();',
				'});',
				'',
				'defineFunction("123 tricky-name", () => {',
				'  // Add blocks to start building your program.',
				'});'
			].join('\n')
		);
	});

	it('allows the held item variable name to be customized', () => {
		expect(
			formatProgramCode({
				program: [
					block('repeat-held', 'loop', {
						count: { type: 'variable', variableId: 'heldItem' },
						children: [block('move', 'move-forward')]
					})
				],
				heldItemName: 'thoughtBubble'
			})
		).toContain('repeat(thoughtBubble, () => {');
	});

	it('uses spaces instead of tabs for generated indentation', () => {
		const code = formatProgramCode({
			program: [
				block('repeat-3', 'loop', {
					count: 3,
					children: [block('move', 'move-forward')]
				})
			]
		});

		expect(code).toContain('  moveForward();');
		expect(code).not.toContain('\t');
	});

	it('maps primitive blocks to generated code lines', () => {
		const formatted = formatProgramCodeWithMap({
			program: [
				block('move', 'move-forward'),
				block('left', 'turn-left'),
				block('right', 'turn-right')
			]
		});

		expect(formatted.code).toBe(['moveForward();', 'turnLeft();', 'turnRight();'].join('\n'));
		expect(formatted.blockLineRanges.get('move')).toEqual({ startLine: 1, endLine: 1 });
		expect(formatted.blockLineRanges.get('left')).toEqual({ startLine: 2, endLine: 2 });
		expect(formatted.blockLineRanges.get('right')).toEqual({ startLine: 3, endLine: 3 });
	});

	it('maps loop blocks and nested children to generated code lines', () => {
		const formatted = formatProgramCodeWithMap({
			program: [
				block('repeat-2', 'loop', {
					count: 2,
					children: [block('move', 'move-forward'), block('left', 'turn-left')]
				})
			]
		});

		expect(formatted.code).toBe(
			['repeat(2, () => {', '  moveForward();', '  turnLeft();', '});'].join('\n')
		);
		expect(formatted.blockLineRanges.get('repeat-2')).toEqual({ startLine: 1, endLine: 4 });
		expect(formatted.blockLineRanges.get('move')).toEqual({ startLine: 2, endLine: 2 });
		expect(formatted.blockLineRanges.get('left')).toEqual({ startLine: 3, endLine: 3 });
	});

	it('maps function body blocks after top-level code', () => {
		const formatted = formatProgramCodeWithMap({
			program: [block('call-helper', 'call', { functionName: 'Helper Path' })],
			functions: {
				'Helper Path': [block('turn-helper', 'turn-left')]
			}
		});

		expect(formatted.code).toBe(
			[
				'callFunction("Helper Path");',
				'',
				'defineFunction("Helper Path", () => {',
				'  turnLeft();',
				'});'
			].join('\n')
		);
		expect(formatted.blockLineRanges.get('call-helper')).toEqual({ startLine: 1, endLine: 1 });
		expect(formatted.blockLineRanges.get('turn-helper')).toEqual({ startLine: 4, endLine: 4 });
	});
});
