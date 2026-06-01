import type { Block, VariableRef } from './types';

export interface FormatProgramCodeOptions {
	program: readonly Block[];
	functions?: Readonly<Record<string, readonly Block[]>>;
	heldItemName?: string;
}

export interface CodeLineRange {
	startLine: number;
	endLine: number;
}

export interface FormattedProgramCode {
	code: string;
	blockLineRanges: ReadonlyMap<string, CodeLineRange>;
}

const INDENT = '  ';

class CodeWriter {
	#depth = 0;
	#lines: string[] = [];
	#blockLineRanges = new Map<string, CodeLineRange>();

	line(text = '') {
		this.#lines.push(text ? `${INDENT.repeat(this.#depth)}${text}` : '');
	}

	block(openingLine: string, writeBody: () => void, closingLine = '});') {
		this.line(openingLine);
		this.#depth++;

		try {
			writeBody();
		} finally {
			this.#depth--;
		}

		this.line(closingLine);
	}

	blockRange(blockId: string, writeBlock: () => void) {
		const startLine = this.#lines.length + 1;
		writeBlock();
		const endLine = this.#lines.length;

		if (endLine >= startLine) {
			this.#blockLineRanges.set(blockId, { startLine, endLine });
		}
	}

	toString(): string {
		return this.#lines.join('\n');
	}

	toFormattedCode(): FormattedProgramCode {
		return {
			code: this.toString(),
			blockLineRanges: new Map(this.#blockLineRanges)
		};
	}
}

export function formatProgramCode({
	program,
	functions = {},
	heldItemName = 'heldItem'
}: FormatProgramCodeOptions): string {
	return formatProgramCodeWithMap({ program, functions, heldItemName }).code;
}

export function formatProgramCodeWithMap({
	program,
	functions = {},
	heldItemName = 'heldItem'
}: FormatProgramCodeOptions): FormattedProgramCode {
	const writer = new CodeWriter();
	writeBlocks(writer, program, heldItemName);
	const functionEntries = Object.entries(functions);

	for (const [name, body] of functionEntries) {
		writer.line();
		writer.block(`defineFunction(${quote(name)}, () => {`, () =>
			writeBlocks(writer, body, heldItemName)
		);
	}

	return writer.toFormattedCode();
}

function writeBlocks(
	writer: CodeWriter,
	blocks: readonly Block[] | undefined,
	heldItemName: string
) {
	if (!blocks || blocks.length === 0) {
		writer.line('// Add blocks to start building your program.');
		return;
	}

	for (const block of blocks) {
		writeBlock(writer, block, heldItemName);
	}
}

function writeBlock(writer: CodeWriter, block: Block, heldItemName: string) {
	writer.blockRange(block.id, () => {
		switch (block.type) {
			case 'move-forward':
				writer.line('moveForward();');
				return;
			case 'turn-left':
				writer.line('turnLeft();');
				return;
			case 'turn-right':
				writer.line('turnRight();');
				return;
			case 'pick-up':
				writer.line('pickUp();');
				return;
			case 'board':
				writer.line('board();');
				return;
			case 'call':
				writer.line(`${formatCall(block)};`);
				return;
			case 'loop': {
				writer.block(formatRepeatCall(block.count, heldItemName), () =>
					writeBlocks(writer, block.children, heldItemName)
				);
				return;
			}
			default: {
				const exhaustive: never = block.type;
				writer.line(`// Unsupported block: ${exhaustive}`);
			}
		}
	});
}

function formatCall(block: Block): string {
	if (!block.functionName) return 'callFunction(/* choose a function */)';
	return `callFunction(${quote(block.functionName)})`;
}

function formatRepeatCall(count: number | VariableRef | undefined, heldItemName: string): string {
	if (count === undefined) return 'repeatForever(() => {';
	return `repeat(${formatRepeatCount(count, heldItemName)}, () => {`;
}

function formatRepeatCount(count: number | VariableRef, heldItemName: string): string {
	if (typeof count === 'number') return String(count);
	if (count.type === 'variable' && count.variableId === 'heldItem') return heldItemName;
	return '0';
}

function quote(value: string): string {
	return JSON.stringify(value);
}
