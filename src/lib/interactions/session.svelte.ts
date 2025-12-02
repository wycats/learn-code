import type { InteractionNode, InteractionMode } from './types';

export class InteractionSession {
	state = $state<'active' | 'committed' | 'cancelled'>('active');
	candidates = $state<InteractionNode[]>([]);
	activeTargetId = $state<string | null>(null);
	activeEdge = $state<'top' | 'bottom' | 'left' | 'right' | null>(null);
	sourceId: string;
	mode: InteractionMode;

	constructor(sourceId: string, mode: InteractionMode, candidates: InteractionNode[]) {
		this.sourceId = sourceId;
		this.mode = mode;
		this.candidates = candidates;
	}

	hover(targetId: string | null, edge: 'top' | 'bottom' | 'left' | 'right' | null = null) {
		if (this.state !== 'active') return;

		// Verify target is a valid candidate
		if (targetId && !this.candidates.find((c) => c.id === targetId)) {
			return;
		}

		this.activeTargetId = targetId;
		this.activeEdge = edge;
	}

	commit() {
		if (this.state !== 'active') return;
		this.state = 'committed';
	}

	cancel() {
		if (this.state !== 'active') return;
		this.state = 'cancelled';
	}
}
