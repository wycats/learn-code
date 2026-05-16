import { registry } from './registry';
import type { InteractionNode, ComponentInterface } from './types';

interface InteractionTargetParams {
	node: InteractionNode;
	api: ComponentInterface;
}

export function interactionTarget(element: HTMLElement, params: InteractionTargetParams) {
	const { node, api } = params;

	// 1. Register Node (Logical)
	// Ideally this is done by GameModel, but we ensure it here for now.
	registry.registerNode(node);

	// 2. Register Component (Visual)
	registry.registerComponent(node.id, api);

	// 3. Add DOM attribute for reverse lookup
	element.setAttribute('data-interaction-id', node.id);

	return {
		update(newParams: InteractionTargetParams) {
			if (newParams.node.id !== node.id) {
				registry.unregisterNode(node.id);
				registry.unregisterComponent(node.id);

				registry.registerNode(newParams.node);
				registry.registerComponent(newParams.node.id, newParams.api);

				element.setAttribute('data-interaction-id', newParams.node.id);
			}
		},
		destroy() {
			registry.unregisterNode(node.id);
			registry.unregisterComponent(node.id);
		}
	};
}
