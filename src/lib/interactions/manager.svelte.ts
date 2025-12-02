import { registry as defaultRegistry, InteractionRegistry } from './registry';
import { InteractionSession } from './session.svelte';
import type { ComponentState, InteractionMode } from './types';
import { SvelteSet } from 'svelte/reactivity';

export class InteractionManager {
	session = $state<InteractionSession | null>(null);
	selection = new SvelteSet<string>();
	registry: InteractionRegistry;

	constructor(registry: InteractionRegistry = defaultRegistry) {
		this.registry = registry;
	}

	select(id: string, multi: boolean = false) {
		if (!multi) {
			this.selection.clear();
		}
		if (this.selection.has(id)) {
			this.selection.delete(id);
		} else {
			this.selection.add(id);
		}
	}

	clearSelection() {
		this.selection.clear();
	}

	startSession(sourceId: string, mode: InteractionMode = 'drag') {
		const sourceNode = this.registry.getNode(sourceId);
		if (!sourceNode) {
			console.warn(`Cannot start session: Source node ${sourceId} not found.`);
			return;
		}

		// Calculate candidates
		// Rule: Target must accept the source's dataType
		const allNodes = this.registry.getAllNodes();
		const candidates = allNodes.filter((target) => {
			if (target.id === sourceId) return false; // Can't drop on self

			// If target is a slot/container, check if it accepts the source type
			if (target.accepts && target.accepts.includes(sourceNode.dataType)) {
				return true;
			}

			return false;
		});

		this.session = new InteractionSession(sourceId, mode, candidates);
	}

	endSession() {
		if (this.session) {
			this.session.cancel();
			this.session = null;
		}
	}

	getComponentState(id: string): ComponentState {
		const isSelected = this.selection.has(id);

		if (!this.session) {
			return { status: 'idle', isSelected };
		}

		if (id === this.session.sourceId) {
			return { status: 'source', isSelected };
		}

		const isCandidate = this.session.candidates.some((c) => c.id === id);
		if (isCandidate) {
			return {
				status: 'candidate',
				isHovered: this.session.activeTargetId === id,
				edge: this.session.activeTargetId === id ? this.session.activeEdge : null,
				isSelected
			};
		}

		return { status: 'disabled', isSelected };
	}
}

export const interactionManager = new InteractionManager();
