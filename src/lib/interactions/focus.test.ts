import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FocusManager } from './focus.svelte';
import { InteractionRegistry } from './registry';
import type { InteractionNode, ComponentInterface } from './types';

describe('FocusManager', () => {
	let registry: InteractionRegistry;
	let focusManager: FocusManager;

	beforeEach(() => {
		registry = new InteractionRegistry();
		focusManager = new FocusManager(registry);
	});

	it('should focus a registered component', () => {
		const node: InteractionNode = { id: 'block-1', role: 'block', dataType: 'statement' };
		const focusSpy = vi.fn();
		const api: ComponentInterface = {
			highlight: () => {},
			clearHighlight: () => {},
			scrollIntoView: () => {},
			getBoundingRect: () => new DOMRect(),
			focus: focusSpy
		};

		registry.registerNode(node);
		registry.registerComponent(node.id, api);

		focusManager.focus('block-1');
		expect(focusSpy).toHaveBeenCalled();
	});

	it('should navigate next', () => {
		const nodes: InteractionNode[] = [
			{ id: 'block-1', role: 'block', dataType: 'statement' },
			{ id: 'block-2', role: 'block', dataType: 'statement' },
			{ id: 'block-3', role: 'block', dataType: 'statement' }
		];

		const focusSpies = {
			'block-1': vi.fn(),
			'block-2': vi.fn(),
			'block-3': vi.fn()
		};

		nodes.forEach((node) => {
			registry.registerNode(node);
			registry.registerComponent(node.id, {
				highlight: () => {},
				clearHighlight: () => {},
				scrollIntoView: () => {},
				getBoundingRect: () => new DOMRect(),
				focus: focusSpies[node.id as keyof typeof focusSpies]
			});
		});

		// Navigate from block-1 to block-2
		focusManager.navigate('block-1', 'next');
		expect(focusSpies['block-2']).toHaveBeenCalled();

		// Navigate from block-3 to block-1 (wrap around)
		focusManager.navigate('block-3', 'next');
		expect(focusSpies['block-1']).toHaveBeenCalled();
	});

	it('should navigate prev', () => {
		const nodes: InteractionNode[] = [
			{ id: 'block-1', role: 'block', dataType: 'statement' },
			{ id: 'block-2', role: 'block', dataType: 'statement' }
		];

		const focusSpies = {
			'block-1': vi.fn(),
			'block-2': vi.fn()
		};

		nodes.forEach((node) => {
			registry.registerNode(node);
			registry.registerComponent(node.id, {
				highlight: () => {},
				clearHighlight: () => {},
				scrollIntoView: () => {},
				getBoundingRect: () => new DOMRect(),
				focus: focusSpies[node.id as keyof typeof focusSpies]
			});
		});

		// Navigate from block-2 to block-1
		focusManager.navigate('block-2', 'prev');
		expect(focusSpies['block-1']).toHaveBeenCalled();

		// Navigate from block-1 to block-2 (wrap around)
		focusManager.navigate('block-1', 'prev');
		expect(focusSpies['block-2']).toHaveBeenCalled();
	});
});
