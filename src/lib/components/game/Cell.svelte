<script lang="ts">
	import type { CellType } from '$lib/game/types';
	import type { TileDefinition } from '$lib/game/schema';
	import { AVATAR_ICONS } from '$lib/game/icons';
	import {
		Star,
		BrickWall,
		Trees,
		Waves,
		Snowflake,
		Mountain,
		Leaf,
		Sun,
		Triangle,
		Cloud
	} from 'lucide-svelte';

	interface Props {
		type: CellType;
		customTile?: TileDefinition;
		x?: number;
		y?: number;
		id?: string;
		highlight?:
			| { targets: string[]; type?: 'pulse' | 'arrow' | 'dim' | 'selection'; fading?: boolean }
			| undefined;
	}

	let { type, customTile, x, y, id, highlight }: Props = $props();

	const isHighlighted = $derived(
		highlight &&
			((id && highlight.targets?.includes(id)) ||
				(x !== undefined && y !== undefined && highlight.targets?.includes(`cell:${x},${y}`)))
	);
	const isFading = $derived(isHighlighted && highlight?.fading);
</script>

<div
	class="cell"
	data-type={type}
	class:highlighted={isHighlighted}
	class:fading={isFading}
	style:background-color={customTile?.visuals.color}
	style:border-color={customTile?.type === 'wall' ? 'rgba(0,0,0,0.2)' : undefined}
	style:border-width={customTile?.type === 'wall' ? '2px' : undefined}
	style:border-style={customTile?.type === 'wall' ? 'solid' : undefined}
>
	{#if customTile}
		{#if customTile.visuals.decal && customTile.visuals.decal in AVATAR_ICONS}
			{@const Icon = AVATAR_ICONS[customTile.visuals.decal as keyof typeof AVATAR_ICONS]}
			<div class="marker">
				<Icon size={24} color="rgba(0,0,0,0.5)" />
			</div>
		{/if}
	{:else if type === 'goal'}
		<div class="goal-marker">
			<Star size={24} color="var(--yellow-7)" fill="var(--yellow-4)" />
		</div>
	{:else if type === 'wall'}
		<div class="wall-marker">
			<BrickWall size={28} color="var(--stone-6)" />
		</div>
	{:else if type === 'forest'}
		<div class="marker">
			<Trees size={24} color="var(--green-3)" />
		</div>
	{:else if type === 'sand'}
		<div class="marker">
			<Sun size={24} color="var(--orange-4)" />
		</div>
	{:else if type === 'water'}
		<div class="marker">
			<Waves size={24} color="var(--blue-5)" />
		</div>
	{:else if type === 'snow'}
		<div class="marker">
			<Snowflake size={24} color="var(--blue-2)" />
		</div>
	{:else if type === 'dirt'}
		<div class="marker">
			<Mountain size={24} color="var(--orange-7)" />
		</div>
	{:else if type === 'grass'}
		<div class="marker">
			<Leaf size={20} color="var(--green-4)" style="opacity: 0.5" />
		</div>
	{:else if type === 'spikes'}
		<div class="marker">
			<Triangle size={24} color="var(--red-7)" fill="var(--red-7)" />
		</div>
	{:else if type === 'cover'}
		<div class="cover-marker">
			<Cloud size={32} color="rgba(255,255,255,0.8)" />
		</div>
	{/if}
</div>

<style>
	.cell {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		display: grid;
		place-items: center;
		position: relative;
		transition: background-color 0.2s var(--ease-3);
	}

	.cell[data-type='grass'] {
		background-color: var(--green-2);
	}

	.cell[data-type='forest'] {
		background-color: var(--green-8);
	}

	.cell[data-type='sand'] {
		background-color: var(--yellow-2);
	}

	.cell[data-type='snow'] {
		background-color: var(--gray-1);
	}

	.cell[data-type='dirt'] {
		background-color: var(--orange-3);
	}

	.cell[data-type='water'] {
		background-color: var(--blue-3);
	}

	.cell[data-type='spikes'] {
		background-color: var(--red-2);
	}

	.cell[data-type='cover'] {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.5);
		box-shadow:
			0 4px 6px rgba(0, 0, 0, 0.1),
			inset 0 0 20px rgba(255, 255, 255, 0.3);
	}

	.cell[data-type='wall'] {
		background-color: var(--stone-3);
		border: 2px solid var(--stone-4);
		box-shadow: var(--shadow-2);
	}

	.cell[data-type='goal'] {
		background-color: var(--yellow-2);
		border: 2px solid var(--yellow-5);
	}

	.goal-marker,
	.marker {
		display: grid;
		place-items: center;
	}

	.cell.highlighted {
		outline: 3px solid var(--brand);
		box-shadow: 0 0 10px var(--brand-dim);
		z-index: 10;
	}

	.cell.highlighted.fading {
		animation: none;
		outline-color: transparent;
		box-shadow: none;
		transition:
			outline-color 2s ease-out,
			box-shadow 2s ease-out;
	}
</style>
