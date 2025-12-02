import { describe, it, expect, beforeEach } from 'vitest';
import { InteractionManager } from './manager.svelte';
import { InteractionRegistry } from './registry';
import type { InteractionNode } from './types';

describe('Interaction System', () => {
	let registry: InteractionRegistry;
	let manager: InteractionManager;

	beforeEach(() => {
		registry = new InteractionRegistry();
		manager = new InteractionManager(registry);
	});

	describe('InteractionRegistry', () => {
		it('registers and retrieves nodes', () => {
			const node: InteractionNode = {
				id: 'block-1',
				role: 'block',
				dataType: 'statement',
				data: {}
			};
			registry.registerNode(node);
			expect(registry.getNode('block-1')).toBe(node);
		});

		it('unregisters nodes', () => {
			const node: InteractionNode = {
				id: 'block-1',
				role: 'block',
				dataType: 'statement',
				data: {}
			};
			registry.registerNode(node);
			registry.unregisterNode('block-1');
			expect(registry.getNode('block-1')).toBeUndefined();
		});
	});

	describe('InteractionManager', () => {
		it('manages selection', () => {
			manager.select('block-1');
			expect(manager.selection.has('block-1')).toBe(true);

			manager.select('block-2');
			expect(manager.selection.has('block-1')).toBe(false);
			expect(manager.selection.has('block-2')).toBe(true);

			manager.select('block-3', true); // Multi-select
			expect(manager.selection.has('block-2')).toBe(true);
			expect(manager.selection.has('block-3')).toBe(true);

			manager.select('block-3', true); // Toggle off
			expect(manager.selection.has('block-3')).toBe(false);
		});

		it('starts a session with valid candidates', () => {
			// Setup nodes
			const source: InteractionNode = {
				id: 'source',
				role: 'block',
				dataType: 'statement',
				data: {}
			};
			const target: InteractionNode = {
				id: 'target',
				role: 'slot',
				dataType: 'statement',
				accepts: ['statement'],
				data: {}
			};
			const invalidTarget: InteractionNode = {
				id: 'invalid',
				role: 'slot',
				dataType: 'integer',
				accepts: ['integer'],
				data: {}
			};

			registry.registerNode(source);
			registry.registerNode(target);
			registry.registerNode(invalidTarget);

			manager.startSession('source');

			expect(manager.session).toBeDefined();
			expect(manager.session?.sourceId).toBe('source');
			expect(manager.session?.candidates).toHaveLength(1);
			expect(manager.session?.candidates[0].id).toBe('target');
		});

		it('calculates component state correctly', () => {
			const source: InteractionNode = {
				id: 'source',
				role: 'block',
				dataType: 'statement',
				data: {}
			};
			const target: InteractionNode = {
				id: 'target',
				role: 'slot',
				dataType: 'statement',
				accepts: ['statement'],
				data: {}
			};

			registry.registerNode(source);
			registry.registerNode(target);

			// Idle state
			expect(manager.getComponentState('source')).toEqual({ status: 'idle', isSelected: false });

			// Active session
			manager.startSession('source');

			expect(manager.getComponentState('source')).toEqual({ status: 'source', isSelected: false });
			expect(manager.getComponentState('target')).toEqual({
				status: 'candidate',
				isHovered: false,
				edge: null,
				isSelected: false
			});
			expect(manager.getComponentState('other')).toEqual({ status: 'disabled', isSelected: false });

			// Hover
			manager.session?.hover('target', 'top');
			expect(manager.getComponentState('target')).toEqual({
				status: 'candidate',
				isHovered: true,
				edge: 'top',
				isSelected: false
			});
		});
	});
});
