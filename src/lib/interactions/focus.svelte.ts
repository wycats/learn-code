import { registry as defaultRegistry, InteractionRegistry } from './registry';

export class FocusManager {
	registry: InteractionRegistry;

	constructor(registry: InteractionRegistry = defaultRegistry) {
		this.registry = registry;
	}

	focus(id: string) {
		const api = this.registry.getComponent(id);
		if (api) {
			api.focus();
			// Also select it in the interaction manager?
			// Maybe not always, but for blocks usually yes.
			// interactionManager.select(id);
		}
	}

	// Simple linear navigation for now
	navigate(currentId: string, direction: 'next' | 'prev') {
		const allNodes = this.registry.getAllNodes();
		// Filter for focusable nodes (blocks, slots, root)
		// We might need a 'focusable' flag or infer from role
		const focusable = allNodes.filter((n) => ['block', 'slot', 'root'].includes(n.role));

		const currentIndex = focusable.findIndex((n) => n.id === currentId);
		if (currentIndex === -1) return;

		let nextIndex = currentIndex;
		if (direction === 'next') {
			nextIndex = (currentIndex + 1) % focusable.length;
		} else {
			nextIndex = (currentIndex - 1 + focusable.length) % focusable.length;
		}

		const nextId = focusable[nextIndex].id;
		this.focus(nextId);
	}
}

export const focusManager = new FocusManager();
