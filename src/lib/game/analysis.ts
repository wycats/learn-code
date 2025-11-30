import type { Block, BlockType } from './schema';

/**
 * Counts the total number of blocks of a specific type in the program,
 * including those nested within loops or other container blocks.
 */
export function countBlocks(program: Block[], type: BlockType): number {
	let count = 0;
	for (const block of program) {
		if (block.type === type) {
			count++;
		}
		if (block.children) {
			count += countBlocks(block.children, type);
		}
	}
	return count;
}

/**
 * Checks if a specific sequence of block types appears contiguously
 * at the same nesting level anywhere in the program.
 */
export function hasSequence(program: Block[], sequence: BlockType[]): boolean {
	if (sequence.length === 0) return true;

	// Check at current level
	for (let i = 0; i <= program.length - sequence.length; i++) {
		let match = true;
		for (let j = 0; j < sequence.length; j++) {
			if (program[i + j].type !== sequence[j]) {
				match = false;
				break;
			}
		}
		if (match) return true;
	}

	// Check recursively in children
	for (const block of program) {
		if (block.children && hasSequence(block.children, sequence)) {
			return true;
		}
	}

	return false;
}

/**
 * Detects common anti-patterns or inefficiencies in the code.
 */
export function detectAntiPatterns(
	program: Block[],
	functions?: Record<string, Block[]>
): string[] {
	const issues: string[] = [];

	// Redundant turns: Left -> Right or Right -> Left
	if (
		hasSequence(program, ['turn-left', 'turn-right']) ||
		hasSequence(program, ['turn-right', 'turn-left'])
	) {
		issues.push('redundant-turn');
	}

	// 360 turn: 4 turns in the same direction
	if (
		hasSequence(program, ['turn-left', 'turn-left', 'turn-left', 'turn-left']) ||
		hasSequence(program, ['turn-right', 'turn-right', 'turn-right', 'turn-right'])
	) {
		issues.push('360-turn');
	}

	// Empty loops
	if (hasEmptyLoop(program)) {
		issues.push('empty-loop');
	}

	// Repeated sequence that could be a loop (simple heuristic: 3+ repetitions of length 1 or 2)
	// This is a bit harder to detect robustly without a suffix tree or similar,
	// but we can check for simple cases like Move, Move, Move, Move
	if (countBlocks(program, 'move-forward') > 4 && !hasLoop(program)) {
		// If we have many moves and no loops, it might be a candidate for a loop,
		// but only if they are sequential.
		if (hasSequence(program, ['move-forward', 'move-forward', 'move-forward', 'move-forward'])) {
			issues.push('missed-loop');
		}
	}

	// Missing function calls
	if (functions) {
		for (const [name, body] of Object.entries(functions)) {
			// If function has body but is not called in the main program
			if (body.length > 0 && !hasFunctionCall(program, name)) {
				issues.push(`missing-call:${name}`);
			}
		}
	}

	return issues;
}

function hasFunctionCall(program: Block[], functionName: string): boolean {
	for (const block of program) {
		if (block.type === 'call' && block.functionName === functionName) {
			return true;
		}
		if (block.children && hasFunctionCall(block.children, functionName)) {
			return true;
		}
	}
	return false;
}

function hasEmptyLoop(program: Block[]): boolean {
	for (const block of program) {
		if (block.type === 'loop') {
			if (!block.children || block.children.length === 0) return true;
			if (hasEmptyLoop(block.children)) return true;
		}
	}
	return false;
}

function hasLoop(program: Block[]): boolean {
	for (const block of program) {
		if (block.type === 'loop') return true;
		if (block.children && hasLoop(block.children)) return true;
	}
	return false;
}
