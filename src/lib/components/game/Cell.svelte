<script lang="ts">
	import type { CellType } from '$lib/game/types';
	import { Star, BrickWall, Trees, Waves, Snowflake, Mountain, Leaf, Sun } from 'lucide-svelte';

	interface Props {
		type: CellType;
		x?: number;
		y?: number;
		highlight?: { target: string; type?: 'pulse' | 'arrow' | 'dim'; fading?: boolean } | undefined;
	}

	let { type, x, y, highlight }: Props = $props();

	const isHighlighted = $derived(
		highlight && x !== undefined && y !== undefined && highlight.target === `cell:${x},${y}`
	);
	const isFading = $derived(isHighlighted && highlight?.fading);
</script>

<div class="cell" data-type={type} class:highlighted={isHighlighted} class:fading={isFading}>
	{#if type === 'goal'}
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
		outline: 3px solid var(--pink-5);
		box-shadow: 0 0 15px var(--pink-5);
		z-index: 10;
		animation: pulse-highlight 1.5s infinite;
	}

	.cell.highlighted.fading {
		animation: none;
		outline-color: transparent;
		box-shadow: none;
		transition:
			outline-color 2s ease-out,
			box-shadow 2s ease-out;
	}

	@keyframes pulse-highlight {
		0% {
			box-shadow: 0 0 0 0 rgba(var(--pink-5-rgb), 0.7);
		}
		70% {
			box-shadow: 0 0 0 10px rgba(var(--pink-5-rgb), 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(var(--pink-5-rgb), 0);
		}
	}
</style>
