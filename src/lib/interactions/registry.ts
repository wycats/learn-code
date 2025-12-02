import { SvelteMap } from 'svelte/reactivity';
import type { InteractionNode, ComponentInterface } from './types';

export class InteractionRegistry {
	// Logical Index: Map of ID -> Node Data
	// Populated by GameModel (or other data sources)
	private nodes = new SvelteMap<string, InteractionNode>();

	// Visual Registry: Map of ID -> Component API
	// Populated by UI Components via use:interactionTarget
	private components = new Map<string, ComponentInterface>();

	registerNode(node: InteractionNode) {
		this.nodes.set(node.id, node);
	}

	unregisterNode(id: string) {
		this.nodes.delete(id);
	}

	getNode(id: string): InteractionNode | undefined {
		return this.nodes.get(id);
	}

	getAllNodes(): InteractionNode[] {
		return Array.from(this.nodes.values());
	}

	registerComponent(id: string, api: ComponentInterface) {
		this.components.set(id, api);
	}

	unregisterComponent(id: string) {
		this.components.delete(id);
	}

	getComponent(id: string): ComponentInterface | undefined {
		return this.components.get(id);
	}
}

export const registry = new InteractionRegistry();
