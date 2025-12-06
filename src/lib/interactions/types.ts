export type InteractionRole =
	| 'block' // A code block (Move Forward, Loop)
	| 'value' // A raw value (Number 5, Color Red)
	| 'variable' // A reference (Held Item)
	| 'slot' // A container for a list of blocks (The "inside" of a loop)
	| 'property' // A specific field on a block (The "count" of a loop)
	| 'root'; // The main program list

export type DataType =
	| 'statement' // A block that performs an action (void)
	| 'integer' // A number (for loop counts)
	| 'color' // A color (for paint)
	| 'any'; // Wildcard

export type InteractionMode = 'drag' | 'move' | 'copy' | 'insert';

export interface InteractionNode {
	id: string;
	role: InteractionRole;
	dataType: DataType;
	data?: unknown; // The backing model (e.g., the Block object)
	parentId?: string;
	accepts?: DataType[]; // For slots/containers, what type do they accept?
}

export interface ComponentInterface {
	highlight(style: 'ghost' | 'ring' | 'pulse'): void;
	clearHighlight(): void;
	scrollIntoView(): void;
	getBoundingRect(): DOMRect;
	focus(): void;
}

export type ComponentState =
	| { status: 'idle'; isSelected: boolean }
	| { status: 'source'; isSelected: boolean }
	| {
			status: 'candidate';
			isHovered: boolean;
			edge: 'top' | 'bottom' | 'left' | 'right' | null;
			isSelected: boolean;
	  }
	| { status: 'disabled'; isSelected: boolean };
