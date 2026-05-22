import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Cell from './Cell.svelte';

describe('Cell item rendering', () => {
	it('renders a key as a bottom pickup token instead of covering the terrain marker', () => {
		const { container } = render(Cell, {
			type: 'grass',
			item: { type: 'key', value: true, icon: 'Key' }
		});

		const terrainMarker = container.querySelector('.marker');
		const itemMarker = container.querySelector('.item-marker');

		expect(terrainMarker).toBeInTheDocument();
		expect(itemMarker).toBeInTheDocument();
		expect(itemMarker).toHaveAttribute('data-item-type', 'key');

		const itemStyle = getComputedStyle(itemMarker as Element);
		expect(itemStyle.position).toBe('absolute');
		expect(itemStyle.left).not.toBe('auto');
		expect(itemStyle.bottom).not.toBe('auto');
	});

	it('renders the locked door with a primary door glyph and a key requirement badge', () => {
		const { container } = render(Cell, {
			type: 'locked-door',
			customTile: {
				id: 'locked-door',
				name: 'Locked Door',
				type: 'wall',
				passableBy: 'key',
				visuals: {
					color: 'var(--amber-2)',
					pattern: 'locked-door'
				}
			}
		});

		expect(container.querySelector('.locked-door-marker')).toBeInTheDocument();
		expect(container.querySelector('.property-overlay.top-right')).toBeInTheDocument();
	});

	it('removes a key cleanly when the item prop is cleared', async () => {
		const rendered = render(Cell, {
			type: 'grass',
			item: { type: 'key', value: true, icon: 'Key' }
		});

		expect(rendered.container.querySelector('.item-marker')).toBeInTheDocument();

		await rendered.rerender({
			type: 'grass',
			item: undefined
		});

		expect(rendered.container.querySelector('.item-marker')).not.toBeInTheDocument();
	});
});
